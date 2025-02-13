import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent } from './login/login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import {MatStep, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {NgxCaptchaModule} from 'ngx-captcha';
import { PollsComponent } from './polls/polls.component';
//import { VehicleUploadComponent } from './vehicle-upload/vehicle-upload.component';
import { MyVehiclesComponent } from './my-vehicles/my-vehicles.component';


@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
    EditProfileComponent,
    PollsComponent,
    //VehicleUploadComponent,
    MyVehiclesComponent,
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
    NgxCaptchaModule
  ]
})
export class UserModule { }
