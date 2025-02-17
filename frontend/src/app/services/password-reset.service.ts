import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserService} from './user.service';
import {Router} from '@angular/router';
import {MyAuthServiceService} from './auth-service/my-auth-service.service';
import {catchError} from 'rxjs';
import {EmployeeService} from './employee.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {

  constructor() { }

    baseUrl:string="http://localhost:7000/api/";
    private http=inject(HttpClient);
    private router=inject(Router);
    private accountService=inject(UserService);
    private employeeService=inject(EmployeeService);
    private authService=inject(MyAuthServiceService);



  ResetPassword(model:any){
      this.http.put<{ userType: string }>(this.baseUrl+'resetpassword/reset',model).subscribe({
      next:(res)=>{
        alert("Password change successful");
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
    this.http.put<{ userType: string }>(this.baseUrl+'resetpassword/change',model).subscribe({
      next:(res)=>{
        alert("Password change successful");
        localStorage.removeItem('auth-token')
        if(res.userType==="user"){
          localStorage.removeItem('user');
          this.accountService.currentUser.set(null);
          void this.router.navigateByUrl("/user/login");
        }
        else {
          localStorage.removeItem('employee');
          this.employeeService.currentEmployee.set(null);
          void this.router.navigateByUrl("/employee/login");
        }
      },
      error:error=>{console.log(error)}
    })
  }





  SendResetToken(model:any){
    return this.http.post<{ isSent: boolean }>(this.baseUrl+'resetpassword/send-reset-token',model);
  }

  ValidatePasswordToken(model:any){
    return this.http.post<{ isValidToken: boolean }>(this.baseUrl+'resetpassword/validate-password-token',model)
  }

}
