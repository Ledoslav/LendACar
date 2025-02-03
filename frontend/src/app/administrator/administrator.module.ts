import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministratorRoutingModule } from './administrator-routing.module';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminProfileOverviewComponent } from './admin-profile-overview/admin-profile-overview.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminEditOwnProfileComponent } from './admin-edit-own-profile/admin-edit-own-profile.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { VehicleCategoriesComponent } from './vehicle-category/vehicle-category.component';
import { AdminEmployeeOverviewComponent } from './admin-employee-overview/admin-employee-overview.component';
import { VehicleOverviewComponent } from './vehicle-overview/vehicle-overview.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import {RegisterComponent} from './register-employee/register.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { AdminCityOverviewComponent } from './admin-city-overview/admin-city-overview.component';
import { AdminCountryOverviewComponent } from './admin-country-overview/admin-country-overview.component';
import { AdminUserUpdateComponent } from './admin-user-update/admin-user-update.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import {PaginationComponent} from "ngx-bootstrap/pagination";
import {MatLabel} from "@angular/material/form-field";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';



@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminProfileOverviewComponent,
    AdminDashboardComponent,
    AdminEditOwnProfileComponent,
    VehicleCategoriesComponent,
    AdminEmployeeOverviewComponent,
    VehicleOverviewComponent,
    UserOverviewComponent,
    RegisterComponent,
    NavComponent,
    HomeComponent,
    AdminCityOverviewComponent,
    AdminCountryOverviewComponent,
    AdminUserUpdateComponent
  ],
  imports: [
    CommonModule,
    AdministratorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    PaginationComponent,
    MatLabel,
    MatDatepicker,
    MatDatepickerModule,
    MatNativeDateModule, // Ensures the DateAdapter is provided
    MatInputModule,
  ]
})
export class AdministratorModule { }
