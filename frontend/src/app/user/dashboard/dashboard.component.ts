import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {EmployeeService} from '../../services/employee.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
      this.isLoggedIn=this.authService.isLoggedIn();
      this.isAppUser=this.authService.isAppUser();
  }

  isLoggedIn: boolean=false;
  isAppUser:boolean=false;
  accountService=inject(UserService);
  authService=inject(MyAuthServiceService);

}


