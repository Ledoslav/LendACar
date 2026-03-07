import {Component, Inject, inject} from '@angular/core';
import {AdminService} from '../../services/administrator.service';

@Component({
  standalone: false,
  selector: 'app-admin-profile-overview',
  templateUrl: './admin-profile-overview.component.html',
  styleUrl: './admin-profile-overview.component.css'
})
export class AdminProfileOverviewComponent {
  adminService=inject(AdminService);
}
