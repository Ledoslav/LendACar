import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {EditProfileComponent} from './edit-profile/edit-profile.component';
import { PollsComponent } from './polls/polls.component';
import { MyVehiclesComponent } from './my-vehicles/my-vehicles.component';
import {AuthGuard} from '../guards/auth.guard';
import { VehicleUploadComponent } from './vehicle-upload/vehicle-upload.component';


const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'polls', component: PollsComponent },
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' },

      {
        path: '',
        canActivate: [AuthGuard],
        data:{
          isLoggedIn:true,
          isAppUser:true
        },
        children: [
          { path: 'userProfile', component: UserProfileComponent },
          { path: 'editProfile', component: EditProfileComponent },
          { path: 'myVehicles', component: MyVehiclesComponent },
          { path:'vehicleUpload', component: VehicleUploadComponent},
        ]
      }
    ]
  }
];




@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
