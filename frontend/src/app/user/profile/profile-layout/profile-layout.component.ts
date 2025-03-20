import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-profile-layout',
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent {

  accountService=inject(UserService);
  logout() {
    this.accountService.currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    window.location.reload();
  }
}
