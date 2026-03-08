import { EmployeeDto } from './../../Models/EmployeeDto';
import { VerificationRequestDto } from './../../Models/VerificationRequestDto';
import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
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
import {TranslateService} from '@ngx-translate/core';


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
  private translate = inject(TranslateService);


  requests: VerificationRequestDto[] = [];
  users: UserDto[] = [];
  cities: City[] = [];
  filteredRequests: VerificationRequestDto[] = [];

  selectedRequest: VerificationRequestDto | null = null;
  selectedUser: UserDto | null = null;


  filter: string = 'all';
  searchQuery: string = '';
  employeeId: number = 0;
  comment: string = '';

  // Pagination & Filtering
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalResults: number = 0;
  selectedCityId: number = 0;
  private filterSubject = new Subject<{search: string, status: string, city: number}>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const currentEmployee = this.employeeService.currentEmployee();
    this.employeeId = currentEmployee?.id || 0;

    this.translate.use('en');

    this.setupFilterStream();
    this.fetchData();
    this.triggerFilter();
  }

  setupFilterStream(): void {
    this.filterSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      switchMap(params => {
        let statusNum: number | undefined = undefined;
        if (params.status === 'active') statusNum = 2;
        else if (params.status === 'approved') statusNum = 1;
        else if (params.status === 'denied') statusNum = 0;
        else if (params.status === 'all') statusNum = -1;

        return this.verificationService.GetFilteredVerificationRequests(statusNum, params.search, params.city);
      })
    ).subscribe(res => {
      this.requests = res;
      this.totalResults = res.length;
      this.applyLocalPagination();
      this.cdr.detectChanges();
    });
  }

  triggerFilter(): void {
    this.currentPage = 1;
    this.filterSubject.next({
      search: this.searchQuery,
      status: this.filter,
      city: this.selectedCityId
    });
  }

  fetchData(): void {
    this.userService.GetAllUsers().subscribe(res => {
      this.users = res.body || [];
      this.cdr.detectChanges();
    });
    this.cityService.GetAllCities().subscribe(res => {
      this.cities = res;
      this.cdr.detectChanges();
    });
  }

  applyLocalPagination(): void {
    this.totalPages = Math.ceil(this.requests.length / this.pageSize) || 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredRequests = this.requests.slice(startIndex, endIndex);
  }

  filterRequests(): void {
    this.triggerFilter();
  }

  selectRequest(request: VerificationRequestDto): void {
    this.selectedRequest = request;
    // Prioritize embedded user data from backend Include
    this.selectedUser = request.user || this.users.find(res => res.id === request.userId) || null;
    this.comment = '';
  }

  approveRequest(request: VerificationRequestDto): void {
    request.denialComment = this.comment;
    request.empAdmId = this.employeeId;
    request.requestStatus = 1;
    request.reviewedByAdmin = false;

    this.verificationService.ConfirmVerificationRequest(request, request.id).subscribe({
      next:_ => { this.triggerFilter(); this.selectedRequest = null; },
      error:err=>console.log(err)
    })
  }

  denyRequest(request: VerificationRequestDto): void {
    request.denialComment = this.comment;
    request.empAdmId = this.employeeId;
    request.requestStatus = 0;
    request.reviewedByAdmin = false;

    this.verificationService.DenyVerificationRequest(request, request.id).subscribe({
      next:_ => { this.triggerFilter(); this.selectedRequest = null; },
      error:err=>console.log(err)
    })
  }


  getStatus(request: VerificationRequestDto | null): string {
    if (!request) return '';
    if (request.requestStatus === 1) return 'Approved';
    if (request.requestStatus === 0) return 'Denied';
    if (request.requestStatus === 2) return 'Active';
    return 'Undefined';
  }

  getUsername(request: VerificationRequestDto): string{
    if (request.user) return request.user.username;
    const user = this.users.find(res => res.id === request.userId);
    return user?.username || 'Unknown';
  }

  getCityName(user: UserDto | null | undefined): string{
    if (user?.city) return user.city.name;
    const city = this.cities.find(res => res.id === user?.cityId);
    return city?.name || 'Unknown';
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyLocalPagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyLocalPagination();
    }
  }

}
