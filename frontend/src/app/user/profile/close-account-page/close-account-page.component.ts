import {Component, inject} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-close-account-page',
  templateUrl: './close-account-page.component.html',
  styleUrl: './close-account-page.component.css'
})
export class CloseAccountPageComponent {

  accountService=inject(UserService);
  router=inject(Router);

  Delete() {
    console.log(this.accountService.currentUser()?.id);
    if(window.confirm("Are you sure you want to delete account?")){
      this.accountService.Delete(this.accountService.currentUser()?.id).subscribe({
        next: result => {
          console.log(result);
          this.accountService.currentUser.set(null);
          localStorage.removeItem('user');
          void this.router.navigateByUrl('/user/dashboard');
        },
        error: err => {
          console.log(err);
          this.accountService.currentUser.set(null);
          localStorage.removeItem('user');
        }
      })
    }
  }
}
