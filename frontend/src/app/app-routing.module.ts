import { AdministratorModule } from './administrator/administrator.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './user/login/login.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {AuthGuard} from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'public',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)  // Lazy load admin modula
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
  {path: '**', redirectTo: 'public', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
