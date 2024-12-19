import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileOverviewComponent } from './profile-overview/profile-overview.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { VerificationRequestComponent } from './verification-request/verification-request.component';


@NgModule({
  declarations: [
    LoginComponent,
    DashboardComponent,
    ProfileOverviewComponent,
    EditProfileComponent,
    VerificationRequestComponent,
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ]
})
export class EmployeeModule { }
