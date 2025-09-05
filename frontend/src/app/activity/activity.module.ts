import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityHomeComponent } from './activity-home/activity-home.component';
import {UserModule} from "../user/user.module";


@NgModule({
  declarations: [
    ActivityHomeComponent
  ],
    imports: [
        CommonModule,
        ActivityRoutingModule,
        UserModule
    ]
})
export class ActivityModule { }
