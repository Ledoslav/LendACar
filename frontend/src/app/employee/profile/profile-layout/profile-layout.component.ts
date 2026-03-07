import {Component, inject} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';
import {EmployeeService} from "../../../services/employee.service";

@Component({
  standalone: false,
  selector: 'app-profile-layout',
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent {
  employeeService=inject(EmployeeService);
  router=inject(Router);

}
