import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {PretragaHomeComponent} from './pretraga-home/pretraga-home.component';

const routes: Routes = [
  {
    path: '', component: PretragaHomeComponent, children: [
      {path: '', redirectTo: 'home', pathMatch: 'full'},
      {path: 'home', component: PretragaHomeComponent},
      {path: '**', redirectTo: 'home', pathMatch: 'full'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PretragaRoutingModule { }
