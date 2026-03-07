import { EmployeeDto } from './../../Models/EmployeeDto';
import { VerificationRequestDto } from './../../Models/VerificationRequestDto';
import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {EmployeeService} from '../../services/employee.service';
import {VerificationRequestService} from '../../services/verificationrequest.service';
import {UserDto} from '../../Models/UserDto';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {Country} from '../../Models/Country';
import {CountryService} from '../../services/country.service';


@Component({
  standalone: false,
  selector: 'app-verification-request',
  templateUrl: './verification-request.component.html',
  styleUrls: ['./verification-request.component.css']
})
export class VerificationRequestComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  employeeService=inject(EmployeeService);
  router=inject(Router);

  userService=inject(UserService);
  cityService=inject(CityService);
  verificationService=inject(VerificationRequestService);


  requests: VerificationRequestDto[] = [];
  users: UserDto[] = [];
  cities: City[] = [];
  filteredRequests: VerificationRequestDto[] = [];

  selectedRequest: VerificationRequestDto | null = null;
  selectedUser: UserDto | null = null;


  filter: string = 'all';
  searchQuery: string = ''; // New property for the search query
  employeeId: number = 0; // Placeholder for logged-in employee's ID
  comment: string = ''; // komentar koji uposlenik unosi kao razlog odobrenja ili odbijanja

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const currentEmployee = this.employeeService.currentEmployee();
    this.employeeId = currentEmployee?.id || 0;

    this.fetchData();
  }

  fetchData(): void {
    this.verificationService.GetVerificationRequests().subscribe(res=>{
      this.requests=res;
      this.filterRequests();
    
    this.cdr.detectChanges();
  })
    this.userService.GetAllUsers().subscribe(res => {
      this.users = res.body || []; // Use `res.body` for the user array
      this.filterRequests();
    
    this.cdr.detectChanges();
  });
    this.cityService.GetAllCities().subscribe(res => {
      this.cities = res;
      this.filterRequests();
    
    this.cdr.detectChanges();
  });
  }


  filterRequests(): void {
    let filtered = this.requests;

    // Apply filter
    if (this.filter === 'active') {
      filtered = filtered.filter((req) => req.requestStatus === 2);
    } else if (this.filter === 'approved') {
      filtered = filtered.filter((req) => req.requestStatus === 1);
    } else if (this.filter === 'denied') {
      filtered = filtered.filter((req) => req.requestStatus === 0);
    }

    // Apply search query
    if (this.searchQuery.trim() !== '') {
      filtered = filtered.filter((req) => {
        const username = this.getUsername(req.userId).toLowerCase();
        return username.includes(this.searchQuery.toLowerCase());
      });
    }

    // Set total pages
    this.totalPages = Math.ceil(filtered.length / this.pageSize);

    // Paginate the filtered requests
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.filteredRequests = filtered.slice(startIndex, endIndex);
  }

  selectRequest(request: VerificationRequestDto): void {
    this.selectedRequest = request;
    this.selectedUser = this.users.find(res => res.id === request.userId) || null;

    console.log(request);
    this.comment = ''; // resetuje komentar
  }

  approveRequest(request: VerificationRequestDto): void {
    request.denialComment = this.comment;
    request.empAdmId = this.employeeId;
    request.requestStatus = 1;
    request.reviewedByAdmin = false;

    this.verificationService.ConfirmVerificationRequest(request, request.id).subscribe({
      next:_ => {window.location.reload();},
      error:err=>console.log(err)
    })
  }

  denyRequest(request: VerificationRequestDto): void {
    request.denialComment = this.comment;
    request.empAdmId = this.employeeId;
    request.requestStatus = 0;
    request.reviewedByAdmin = false;

    this.verificationService.DenyVerificationRequest(request, request.id).subscribe({
      next:_ => {window.location.reload();},
      error:err=>console.log(err)
    })
  }


  getStatus(request: VerificationRequestDto | null): string {
    if (!request) return '';
    if (request.requestStatus === 1) {
      return 'Approved';
    }
    else if (request.requestStatus === 0) {
      return 'Denied';
    }
    else if (request.requestStatus === 2){
      return 'Active';
    }
    else{
      return 'Undefined'
    }
  }

  getUsername(userId:number): string{
    const user = this.users.find(res => res.id === userId);
    return user?.username || 'Unknown';
  }

  getCityName(cityId:number): string{
    const city = this.cities.find(res => res.id === cityId);
    return city?.name || 'Unknown';
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterRequests();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterRequests();
    }
  }

}
