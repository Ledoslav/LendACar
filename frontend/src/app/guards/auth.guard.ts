import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  GuardResult,
  MaybeAsync, Router,
  RouterStateSnapshot
} from '@angular/router';
import {inject, Injectable} from '@angular/core';
import {MyAuthServiceService} from '../services/auth-service/my-auth-service.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {UserService} from '../services/user.service';
import {AdminService} from '../services/administrator.service';
import {EmployeeService} from '../services/employee.service';
import {HttpClient} from '@angular/common/http';


export class AuthGuardData {
  isAdmin?: boolean;
  isEmployee?: boolean;
  isLoggedIn?: boolean;
  isAppUser?:boolean;
}

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

    constructor(private authService:MyAuthServiceService,private router:Router,private jwtHelper:JwtHelperService,
                private accountService:UserService,private adminService:AdminService,private employeeService:EmployeeService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        const guardData=route.data as AuthGuardData;

        const tokenData=this.authService.getToken();
        const token=tokenData?.token ?? "";

        if(this.jwtHelper.isTokenExpired(token)){
          if(tokenData?.claims?.isAppUser){
            this.accountService.currentUser.set(null);
            localStorage.removeItem('auth-token');
            this.router.navigate(['/public/home']);
            return false;
          }
          if(tokenData?.claims?.isAdmin){
            this.adminService.currentAdmin.set(null);
            localStorage.removeItem('auth-token');
            this.router.navigate(['/public/home']);
            return false;
          }
          if(tokenData?.claims?.isEmployee){
            this.employeeService.currentEmployee.set(null);
            localStorage.removeItem('auth-token');
            this.router.navigate(['/public/home']);
            return false;
          }
        }

      if(guardData.isLoggedIn) {
        if(!this.authService.isLoggedIn()){
          console.log("Nema loggin")
          this.router.navigate(['/public/home']); // treba se napraviti unauthorized komponenta, privremeno rjesenje
          return false;
        }
      }

      if(guardData.isEmployee){
        if(!this.authService.isEmployee()){
          console.log("Nije employee")
          this.router.navigate(['/public/home']); // treba se napraviti unauthorized komponenta, privremeno rjesenje
          return false;
        }
      }

      if(guardData.isAdmin){
        if(!this.authService.isAdmin()){
          console.log("Nije admin")
          this.router.navigate(['/public/home']); // treba se napraviti unauthorized komponenta, privremeno rjesenje
          return false;
        }
      }

      if(guardData.isAppUser){
        if(!this.authService.isAppUser()){
          console.log("Nije user")
          this.router.navigate(['/public/home']); // treba se napraviti unauthorized komponenta, privremeno rjesenje
          return false;
        }
      }



      return true;
    }
}
