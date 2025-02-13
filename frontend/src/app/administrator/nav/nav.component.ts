import {Component, inject} from '@angular/core';
import {AdminService} from '../../services/administrator.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-nav-admin',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  adminService=inject(AdminService);
  router=inject(Router);

  logout() {
    this.adminService.currentAdmin.set(null);
    localStorage.removeItem('administrator');
    localStorage.removeItem('auth-token');
    void this.router.navigateByUrl('/admin/login');
  }
}
