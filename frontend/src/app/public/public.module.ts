import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import {HomeComponent} from './home/home.component';
import {LayoutComponent} from './layout/layout.component';
import {DataRowOutlet} from "@angular/cdk/table";
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {UserModule} from "../user/user.module";
import {TranslatePipe} from '@ngx-translate/core';


@NgModule({
  declarations: [
    HomeComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    DataRowOutlet,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    UserModule,
    TranslatePipe
  ]
})
export class PublicModule { }
