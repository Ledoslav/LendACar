import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile-layout',
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent implements OnInit{
  ngOnInit(): void {
     console.log("User photo",this.accountService.currentUser());
  }

  accountService=inject(UserService);
  router=inject(Router);
  logout() {
    this.accountService.currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    void this.router.navigate(['public/home']);
  }
}
