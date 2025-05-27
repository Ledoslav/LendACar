import {Component, inject} from '@angular/core';
import {EmployeeService} from '../../services/employee.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  employeeService=inject(EmployeeService);
  router=inject(Router);

  logout() {
    this.employeeService.currentEmployee.set(null);
    localStorage.removeItem('employee');
    localStorage.removeItem('auth-token')
    void this.router.navigateByUrl('/employee/login');
  }
}
