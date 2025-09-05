import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from '../chat/dashboard/dashboard.component';
import {SavedModule} from './saved.module';
import {SavedHomeComponent} from './saved-home/saved-home.component';

const routes: Routes = [
  { path: '', component: SavedHomeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SavedRoutingModule { }
