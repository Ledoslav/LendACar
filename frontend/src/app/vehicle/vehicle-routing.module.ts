import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import { VehicleListingComponent } from './vehicle-listing/vehicle-listing';
import { ReservationFormComponent } from './reservation-form/reservation-form.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path:'dashboard', component:DashboardComponent},
      {path: '**', redirectTo: 'home', pathMatch: 'full'},
      {path:'listing/:id', component: VehicleListingComponent},
      {path:'reservationForm/:id', component: ReservationFormComponent},
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleRoutingModule { }
