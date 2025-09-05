import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SavedRoutingModule } from './saved-routing.module';
import { SavedHomeComponent } from './saved-home/saved-home.component';
import {UserModule} from '../user/user.module';


@NgModule({
  declarations: [
    SavedHomeComponent
  ],
  imports: [
    CommonModule,
    SavedRoutingModule,
    UserModule
  ]
})
export class SavedModule { }
