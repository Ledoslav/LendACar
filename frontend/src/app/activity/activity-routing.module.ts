import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from '../chat/dashboard/dashboard.component';
import {ActivityHomeComponent} from './activity-home/activity-home.component';

const routes: Routes = [
  { path: '', component: ActivityHomeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityRoutingModule { }
