import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent } from './login/login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import {MatStep, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {NgxCaptchaModule} from 'ngx-captcha';
import { PollsComponent } from './polls/polls.component';
import { VehicleUploadComponent } from './vehicle-upload/vehicle-upload.component';
import { MyVehiclesComponent } from './my-vehicles/my-vehicles.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProfileLayoutComponent } from './profile/profile-layout/profile-layout.component';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import { ProfilePageComponent } from './profile/profile-page/profile-page.component';
import { PhotoPageComponent } from './profile/photo-page/photo-page.component';
import { AccountSecurityPageComponent } from './profile/account-security-page/account-security-page.component';
import { MyVehiclesPageComponent } from './profile/my-vehicles-page/my-vehicles-page.component';
import { ReservationHistoryPageComponent } from './profile/reservation-history-page/reservation-history-page.component';
import { CloseAccountPageComponent } from './profile/close-account-page/close-account-page.component';
import {FileUploadModule} from "ng2-file-upload";
import {ImageCropperComponent} from 'ngx-image-cropper';
import { VerificationRequestPageComponent } from './profile/verification-request-page/verification-request-page.component';
import { NavbarComponent } from './navbar/navbar.component';


@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    PollsComponent,
    VehicleUploadComponent,
    MyVehiclesComponent,
    ProfileLayoutComponent,
    ProfilePageComponent,
    PhotoPageComponent,
    AccountSecurityPageComponent,
    MyVehiclesPageComponent,
    ReservationHistoryPageComponent,
    CloseAccountPageComponent,
    VerificationRequestPageComponent,
    NavbarComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    MatStep,
    MatLabel,
    MatFormField,
    MatStepper,
    ReactiveFormsModule,
    MatStepperNext,
    MatError,
    MatStepperPrevious,
    NgxCaptchaModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatStepperModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    NgOptimizedImage,
    FileUploadModule,
    ImageCropperComponent,

  ]
})
export class UserModule { }
