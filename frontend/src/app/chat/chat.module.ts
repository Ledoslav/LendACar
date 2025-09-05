import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {UserModule} from "../user/user.module";
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    UserModule,
    FormsModule
  ]
})
export class ChatModule { }
