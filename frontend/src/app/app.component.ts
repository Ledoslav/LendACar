import {Component, inject, OnInit} from '@angular/core';
import {UserService} from './services/user.service';
import {UserDto} from './Models/UserDto';
import {EmployeeDto} from './Models/EmployeeDto';
import {EmployeeService} from './services/employee.service';
import {AdminService} from './services/administrator.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  private accountService=inject(UserService)
  private employeeService=inject(EmployeeService)
  private adminService=inject(AdminService);
  ngOnInit() {
    this.setCurrentUSer();
    this.setCurrentEmployee();
    this.setCurrentAdmin();
  }

  setCurrentUSer(){
    const userString=localStorage.getItem('user');
    if(!userString)return;
    const user:UserDto=JSON.parse(userString);
    this.accountService.currentUser.set(user);
  }

  setCurrentEmployee(){
    const userString=localStorage.getItem('employee');
    if(!userString)return;
    const employee:EmployeeDto=JSON.parse(userString);
    this.employeeService.currentEmployee.set(employee);
  }
  setCurrentAdmin(){
    const adminString=localStorage.getItem('administrator');
    if(!adminString)return;
    const admin:EmployeeDto=JSON.parse(adminString);
    this.adminService.currentAdmin.set(admin);
  }
}
