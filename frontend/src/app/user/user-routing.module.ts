import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import { PollsComponent } from './polls/polls.component';
import { MyVehiclesComponent } from './my-vehicles/my-vehicles.component';
import {AuthGuard} from '../guards/auth.guard';
import { VehicleUploadComponent } from './vehicle-upload/vehicle-upload.component';
import {ProfileLayoutComponent} from './profile/profile-layout/profile-layout.component';
import {ProfilePageComponent} from './profile/profile-page/profile-page.component';
import {PhotoPageComponent} from './profile/photo-page/photo-page.component';
import {AccountSecurityPageComponent} from './profile/account-security-page/account-security-page.component';
import {MyVehiclesPageComponent} from './profile/my-vehicles-page/my-vehicles-page.component';
import {ReservationHistoryPageComponent} from './profile/reservation-history-page/reservation-history-page.component';
import {CloseAccountPageComponent} from './profile/close-account-page/close-account-page.component';
import {
  VerificationRequestPageComponent
} from './profile/verification-request-page/verification-request-page.component';
import {NavbarComponent} from './navbar/navbar.component';


const routes: Routes = [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'polls', component: PollsComponent },
      { path: 'nav', component: NavbarComponent },
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' },


      {
        path: '',
        canActivate: [AuthGuard],
         component:LayoutComponent,
        data:{
          isLoggedIn:true,
          isAppUser:true
        },
        children: [
          { path: 'myVehicles', component: MyVehiclesComponent },
          { path:'vehicleUpload', component: VehicleUploadComponent},
          { path:'profile',component:ProfileLayoutComponent,children:
              [
                { path: '', redirectTo: 'edit-profile', pathMatch: 'full' },
                { path:'edit-profile', component: ProfilePageComponent},
                { path:'edit-photo', component: PhotoPageComponent},
                { path:'edit-account-security', component: AccountSecurityPageComponent},
                { path:'my-vehicles', component: MyVehiclesPageComponent},
                { path:'reservation-history', component: ReservationHistoryPageComponent},
                { path:'close-account', component: CloseAccountPageComponent},
                { path:'verification-request', component: VerificationRequestPageComponent},
              ]
          },

        ]
      }
];




@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
