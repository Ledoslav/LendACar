import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { VerificationRequestComponent } from './verification-request/verification-request.component';
import { PollManagementComponent } from './poll-management/poll-management.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { EmployeeLayoutComponent } from './employee-layout/employee-layout.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProfileLayoutComponent } from './profile/profile-layout/profile-layout.component';
import { ProfilePageComponent } from './profile/profile-page/profile-page.component';
import { AccountSecurityPageComponent } from './profile/account-security-page/account-security-page.component';
import { PhotoPageComponent } from './profile/photo-page/photo-page.component';
import {ImageCropperComponent} from 'ngx-image-cropper';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {TranslateModule} from '@ngx-translate/core';


@NgModule({
  declarations: [
    LoginComponent,
    DashboardComponent,
    VerificationRequestComponent,
    PollManagementComponent,
    ForgotPasswordComponent,
    EmployeeLayoutComponent,
    NavbarComponent,
    ProfileLayoutComponent,
    ProfilePageComponent,
    AccountSecurityPageComponent,
    PhotoPageComponent,
  ],
    imports: [
        CommonModule,
        EmployeeRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        DatePipe,
        ImageCropperComponent,
        MatProgressSpinner,
        TranslateModule
    ]
})
export class EmployeeModule { }
