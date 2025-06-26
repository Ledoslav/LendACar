import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  accountService=inject(UserService);
  authService=inject(MyAuthServiceService);

  ngOnInit(): void {
    this.isLoggedIn=this.authService.isLoggedIn();
    this.isAppUser=this.authService.isAppUser();
  }

  isLoggedIn: boolean=false;
  isAppUser:boolean=false;

}
