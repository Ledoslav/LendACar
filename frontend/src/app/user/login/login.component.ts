import {Component, inject} from '@angular/core';
import {UserService} from '../../services/user.service';
import {LoginUserDto} from '../../Models/LoginUserDto';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
accountService=inject(UserService);
  model:any={};
  router=inject(Router);
  passwordShow:boolean=false;

  login() {
    this.accountService.Login(this.model).subscribe({
      next:res=>{
        alert("User login successfully");
        console.log(res);
        void this.router.navigateByUrl('/user/dashboard');
      },
      error:err=>{
        //alert("Invalid login credentials");
        console.log(err);
      }
    })
    console.log(this.accountService.currentUser());
    console.log("Login 2");
  }
}
