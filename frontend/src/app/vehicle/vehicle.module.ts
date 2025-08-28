import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleRoutingModule } from './vehicle-routing.module';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms'
import { VehicleListingComponent } from './vehicle-listing/vehicle-listing';
import { UserModule } from "../user/user.module";


@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    VehicleListingComponent
  ],
  imports: [
    CommonModule,
    VehicleRoutingModule,
    FormsModule,
    UserModule
]
})
export class VehicleModule { }
