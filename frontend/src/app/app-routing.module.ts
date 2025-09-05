import { AdministratorModule } from './administrator/administrator.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './user/login/login.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {AuthGuard} from './guards/auth.guard';
import {NotFoundComponent} from './shared/not-found/not-found.component';
import {NotAuthorizedComponent} from './shared/not-authorized/not-authorized.component';

const routes: Routes = [
  { path: '', redirectTo: 'public/home', pathMatch: 'full' },
  {
    path:'not-found',
    component: NotFoundComponent
  },
  {
    path:'not-authorized',
    component: NotAuthorizedComponent
  },

  {
    path: 'public',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)  // Lazy load admin modula
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule)
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.module').then(m => m.ActivityModule)
  },
  {
    path: 'saved',
    loadChildren: () => import('./saved/saved.module').then(m => m.SavedModule)
  },
  {
    path: 'pretraga',
    loadChildren: () => import('./pretraga/pretraga.module').then(m => m.PretragaModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'vehicle',
    loadChildren: () => import('./vehicle/vehicle.module').then(m => m.VehicleModule)
  },
  {
    path: 'company',
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule)
  },
  {
    path:'employee',
    loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule),
  },
  {
    path:'admin',
    loadChildren: () => import('./administrator/administrator.module').then(m => m.AdministratorModule),
  },
  {
    path:'resetPassword',
    component: ForgotPasswordComponent
  },
  {path: '**', redirectTo: 'not-found', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
