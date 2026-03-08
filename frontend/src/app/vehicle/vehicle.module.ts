import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleRoutingModule } from './vehicle-routing.module';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms'
import { VehicleListingComponent } from './vehicle-listing/vehicle-listing';
import { UserModule } from "../user/user.module";
import { ReservationFormComponent } from './reservation-form/reservation-form.component';
import { ReservationSuccessComponent } from './reservation-success/reservation-success.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    VehicleListingComponent,
    ReservationFormComponent,
    ReservationSuccessComponent
  ],
  imports: [
    CommonModule,
    VehicleRoutingModule,
    FormsModule,
    UserModule,
    GoogleMapsModule,
    TranslateModule
]
})
export class VehicleModule { }
