import {Component, inject, OnInit} from '@angular/core';
import {EmployeeService} from '../../services/employee.service';
import {Router} from '@angular/router';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  ngOnInit(): void {
      //let employee=localStorage.getItem('auth-token');
      let isEmployee=this.authService.isEmployee()
      if(isEmployee){
        void this.router.navigateByUrl('/employee/dashboard');
      }
  }
  passwordShow:boolean = false;

  employeeService=inject(EmployeeService);
  model:any={};
  router=inject(Router);
  authService=inject(MyAuthServiceService)

  login(){
    this.employeeService.Login(this.model).subscribe({
      next:res=>{
        void this.router.navigateByUrl('/employee/dashboard');
      },
      error:err=>{
        console.log(err);
      }
    })
  }



}
