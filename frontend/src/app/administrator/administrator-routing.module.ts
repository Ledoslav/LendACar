import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdminLoginComponent} from './admin-login/admin-login.component';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {AdminProfileOverviewComponent} from './admin-profile-overview/admin-profile-overview.component';
import {AdminEditOwnProfileComponent} from './admin-edit-own-profile/admin-edit-own-profile.component';
import { VehicleCategoriesComponent } from './vehicle-category/vehicle-category.component';
import {AdminEmployeeOverviewComponent} from './admin-employee-overview/admin-employee-overview.component';
import { VehicleOverviewComponent } from './vehicle-overview/vehicle-overview.component';
import { UserOverviewComponent } from './user-overview/user-overview.component';
import {RegisterComponent} from './register-employee/register.component';
import {HomeComponent} from './home/home.component';
import {AdminCityOverviewComponent} from './admin-city-overview/admin-city-overview.component';
import {AdminCountryOverviewComponent} from './admin-country-overview/admin-country-overview.component';
import {AdminUserUpdateComponent} from './admin-user-update/admin-user-update.component';

const routes: Routes = [
  {path:'',redirectTo:'login' ,pathMatch:'full'},
  {path:'login', component: AdminLoginComponent},
  {path:'dashboard', component: AdminDashboardComponent,children:[
      {path:'',redirectTo:'home',pathMatch:'full'},
      {path:'profileOverview', component: AdminProfileOverviewComponent},
      {path:'profileEdit',component:AdminEditOwnProfileComponent},
      {path:'vehicleCategories',component: VehicleCategoriesComponent},
      {path:'employeeOverview',component: AdminEmployeeOverviewComponent},
      {path:'vehicleOverview',component: VehicleOverviewComponent},
      {path:'userOverview',component: UserOverviewComponent},
      {path:'home',component: HomeComponent},
      {path:'city',component:AdminCityOverviewComponent},
      {path:'country',component:AdminCountryOverviewComponent},
    ]},
  {path:'user-update',component:AdminUserUpdateComponent},
  {path:'register',component: RegisterComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministratorRoutingModule { }
