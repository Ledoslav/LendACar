import { VerificationRequestComponent } from './verification-request/verification-request.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import { PollManagementComponent } from './poll-management/poll-management.component';
import {AuthGuard} from '../guards/auth.guard';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
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
      {path:'dashboard', component: DashboardComponent},
      {path:'verificationRequests',component:VerificationRequestComponent},
      {path:'pollManagement', component:PollManagementComponent},
      {path:'profile', component:ProfileLayoutComponent, children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', component: ProfilePageComponent  },
          { path:'edit-account-security', component: AccountSecurityPageComponent},
          { path:'edit-photo', component: PhotoPageComponent}

        ]},
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
    ]
  }

];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
