import {Component, inject, OnInit} from '@angular/core';
import {EmployeeService} from '../../services/employee.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent{
  employeeService=inject(EmployeeService);
  router=inject(Router);

  logout() {
    this.employeeService.currentEmployee.set(null);
    localStorage.removeItem('employee');
    localStorage.removeItem('auth-token')
    void this.router.navigateByUrl('/employee/login');
  }

}
