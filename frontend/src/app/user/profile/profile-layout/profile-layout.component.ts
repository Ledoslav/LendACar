import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-profile-layout',
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent implements OnInit{
  ngOnInit(): void {
     console.log("User photo",this.accountService.currentUser());

    if(localStorage.getItem('mode') == 'dark-mode'){
      this.mode = 'dark-mode';
      this.switchClicked = true;
    }else{
      this.mode = 'light-mode';
      this.switchClicked = false;
    }
  }

  switchClicked: boolean = false;
  mode: string = 'light-mode';

  toggleDarkMode() {
    this.switchClicked = !this.switchClicked;
    if (this.switchClicked) {
      this.mode = 'dark-mode';
      localStorage.setItem('mode', this.mode);
    } else {
      this.mode = 'light-mode';
      localStorage.setItem('mode', this.mode);
    }
    window.location.reload();
  }

  accountService=inject(UserService);
  router=inject(Router);
}
