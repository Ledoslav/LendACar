import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import { VehicleListingComponent } from './vehicle-listing/vehicle-listing';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path:'dashboard', component:DashboardComponent},
      {path: '**', redirectTo: 'home', pathMatch: 'full'},
      {path:'listing/:id', component: VehicleListingComponent},
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleRoutingModule { }
