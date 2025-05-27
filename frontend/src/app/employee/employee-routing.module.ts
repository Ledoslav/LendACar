import { VerificationRequestComponent } from './verification-request/verification-request.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ProfileOverviewComponent} from './profile-overview/profile-overview.component';
import {EditProfileComponent} from './edit-profile/edit-profile.component';
import { PollManagementComponent } from './poll-management/poll-management.component';
import {AuthGuard} from '../guards/auth.guard';
import {VehicleCategoriesComponent} from '../administrator/vehicle-category/vehicle-category.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {AdminDashboardComponent} from '../administrator/admin-dashboard/admin-dashboard.component';
import {AdminProfileOverviewComponent} from '../administrator/admin-profile-overview/admin-profile-overview.component';
import {AdminEditOwnProfileComponent} from '../administrator/admin-edit-own-profile/admin-edit-own-profile.component';
import {
  AdminEmployeeOverviewComponent
} from '../administrator/admin-employee-overview/admin-employee-overview.component';
import {VehicleOverviewComponent} from '../administrator/vehicle-overview/vehicle-overview.component';
import {UserOverviewComponent} from '../administrator/user-overview/user-overview.component';
import {HomeComponent} from '../administrator/home/home.component';
import {AdminCityOverviewComponent} from '../administrator/admin-city-overview/admin-city-overview.component';
import {AdminCountryOverviewComponent} from '../administrator/admin-country-overview/admin-country-overview.component';
import {EmployeeLayoutComponent} from './employee-layout/employee-layout.component';
import {ProfileLayoutComponent} from './profile/profile-layout/profile-layout.component';
import {ProfilePageComponent} from './profile/profile-page/profile-page.component';
import {AccountSecurityPageComponent} from './profile/account-security-page/account-security-page.component';
import {PhotoPageComponent} from './profile/photo-page/photo-page.component';

const routes: Routes = [
  {path:'login', component: LoginComponent},
  {path:'forgotPassword', component:ForgotPasswordComponent},
  {
    path:'',
    component: EmployeeLayoutComponent,
    canActivate:[AuthGuard],
    data:{isEmployee:true},
    children:[
      {path:'',redirectTo:'dashboard' ,pathMatch:'full'},
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
      {path:'dashboard', component: DashboardComponent},
      {path:'profileOverview', component: ProfileOverviewComponent},
      {path:'profileEdit',component:EditProfileComponent},
      {path:'verificationRequests',component:VerificationRequestComponent},
      {path:'pollManagement', component:PollManagementComponent},
      {path:'profile', component:ProfileLayoutComponent, children: [
          { path: '', redirectTo: 'edit-profile', pathMatch: 'full' },
          { path: 'overview', component: ProfilePageComponent  },
          { path:'edit-account-security', component: AccountSecurityPageComponent},
          { path:'edit-photo', component: PhotoPageComponent}

        ]},
    ]
  }

];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
