import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityHomeComponent } from './activity-home/activity-home.component';
import {UserModule} from "../user/user.module";
import {FormsModule} from "@angular/forms";
import {TranslatePipe} from '@ngx-translate/core';


@NgModule({
  declarations: [
    ActivityHomeComponent
  ],
  imports: [
    CommonModule,
    ActivityRoutingModule,
    UserModule,
    FormsModule,
    TranslatePipe
  ]
})
export class ActivityModule { }
