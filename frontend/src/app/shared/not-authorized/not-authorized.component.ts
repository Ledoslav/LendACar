import {Component, inject} from '@angular/core';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-not-authorized',
  templateUrl: './not-authorized.component.html',
  styleUrl: './not-authorized.component.css'
})
export class NotAuthorizedComponent {
  private authService=inject(MyAuthServiceService)
  private router=inject(Router);

  navigateUserToHomePage(){
    const isAdmin=this.authService.isAdmin();
    const isEmployee=this.authService.isEmployee();
    const isUser=this.authService.isAppUser();

    if(isAdmin)
      void this.router.navigateByUrl('/admin/dashboard/home');
    else if(isEmployee)
      void this.router.navigateByUrl('/employee/dashboard')
    else if(isUser)
      void this.router.navigateByUrl('/public/home');
    else
      void this.router.navigateByUrl('/public/home');

  }
}
