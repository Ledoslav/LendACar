import { EmployeeDto } from './../../Models/EmployeeDto';
import { VerificationRequestDto } from './../../Models/VerificationRequestDto';
import { Component,inject, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-verification-request',
  templateUrl: './verification-request.component.html',
  styleUrls: ['./verification-request.component.css']
})
export class VerificationRequestComponent implements OnInit {

  employeeService=inject(EmployeeService);
  userService=inject(UserService);
  verificationService=inject(VerificationRequestService);
  router=inject(Router);


  requests: VerificationRequestDto[] = [];
  filteredRequests: VerificationRequestDto[] = [];
  selectedRequest: VerificationRequestDto | null = null;
  filter: string = 'all';
  employeeId: number = 0; // Placeholder for logged-in employee's ID
  comment: string = ''; // komentar koji uposlenik unosi kao razlog odobrenja ili odbijanja

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const currentEmployee = this.employeeService.currentEmployee();
    this.employeeId = currentEmployee?.id || 0;

    this.fetchRequests();
  }

  fetchRequests(): void {
    this.verificationService.GetVerificationRequests().subscribe(res=>{
      this.requests=res;
    })
  }

  filterRequests(): void {
    if (this.filter === 'active') {
      this.filteredRequests = this.requests.filter((req) => req.employeeId === null);
    } 
    else if (this.filter === 'approved') {
      this.filteredRequests = this.requests.filter((req) => req.isApproved === true);
    } 
    else if (this.filter === 'denied') {
      this.filteredRequests = this.requests.filter((req) => req.isApproved === false);
    } 
    else {
      this.filteredRequests = this.requests;
    }
  }

  selectRequest(request: VerificationRequestDto): void {
    this.selectedRequest = request;
    this.comment = ''; // resetuje komentar
  }

  approveRequest(request: VerificationRequestDto): void {
    request.denialComment = this.comment;
    request.employeeId = this.employeeId;
    request.isApproved = true;

    this.verificationService.ConfirmVerificationRequest(request, request.id).subscribe({
      next:_ => {window.location.reload();},
      error:err=>console.log(err)
    })
  }

  denyRequest(request: VerificationRequestDto): void {
    request.denialComment = this.comment;
    request.employeeId = this.employeeId;
    request.isApproved = false;

    this.verificationService.DenyVerificationRequest(request, request.id).subscribe({
      next:_ => {window.location.reload();},
      error:err=>console.log(err)
    })
  }


  getStatus(request: VerificationRequestDto | null): string {
    if (!request) return '';
    if (request.isApproved === true) {
      return 'Approved';
    } 
    else if (request.isApproved === false) {
      return 'Denied';
    } 
    else {
      return 'Active';
    }
  }

}

