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
        void this.router.navigateByUrl('/public/home');
      },
      error:err=>{
        console.log(err);
      }
    })
  }
}
