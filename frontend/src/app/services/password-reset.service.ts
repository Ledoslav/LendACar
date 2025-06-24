import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserService} from './user.service';
import {Router} from '@angular/router';
import {MyAuthServiceService} from './auth-service/my-auth-service.service';
import {catchError, timeout} from 'rxjs';
import {EmployeeService} from './employee.service';
import {MySnackbarService} from './snackbars/my-snackbar.service';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {

  constructor() { }

    private baseUrl = MyConfig.api_address + 'resetpassword';
    private http=inject(HttpClient);
    private router=inject(Router);
    private accountService=inject(UserService);
    private employeeService=inject(EmployeeService);
    private authService=inject(MyAuthServiceService);
    private snackBarService=inject(MySnackbarService);


  ResetPassword(model:any){
      this.http.put<{ userType: string }>(this.baseUrl+'reset',model).subscribe({
      next:(res)=>{
        this.snackBarService.showSuccessMessage("Password change successful")
        if(res.userType==="user"){
          void this.router.navigateByUrl("/user/login");
        }
        else {
          void this.router.navigateByUrl("/employee/login");
        }
      },
      error:error=>{console.log(error)}
    })
  }


  ChangePassword(model:any){
    this.http.put<{ userType: string }>(this.baseUrl+'change',model).subscribe({
      next:(res)=>{
        this.snackBarService.showSuccessMessage("Password change successful")
        localStorage.removeItem('auth-token')
        if(res.userType==="user"){
          localStorage.removeItem('user');
          localStorage.removeItem('auth-token')
          this.accountService.currentUser.set(null);
          void this.router.navigateByUrl("/user/login");
        }
        else {
          localStorage.removeItem('employee');
          localStorage.removeItem('auth-token')
          this.employeeService.currentEmployee.set(null);
          void this.router.navigateByUrl("/employee/login");
        }
      },
      error:error=>{console.log(error)}
    })
  }





  SendResetToken(model:any){
    return this.http.post<{ isSent: boolean }>(this.baseUrl+'send-reset-token',model);
  }

  ValidatePasswordToken(model:any){
    return this.http.post<{ isValidToken: boolean }>(this.baseUrl+'validate-password-token',model)
  }

}
