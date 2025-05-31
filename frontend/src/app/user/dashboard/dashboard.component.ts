import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {EmployeeService} from '../../services/employee.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
      this.isLoggedIn=this.authService.isLoggedIn();
      this.isAppUser=this.authService.isAppUser();
  }

  isLoggedIn: boolean=false;
  isAppUser:boolean=false;
  accountService=inject(UserService);
  authService=inject(MyAuthServiceService);

}


