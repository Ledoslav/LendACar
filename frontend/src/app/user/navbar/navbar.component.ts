import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import {CompanyEmployeeService} from '../../services/companyemployee.service';


@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  accountService=inject(UserService);
  router=inject(Router);
  authService=inject(MyAuthServiceService);
  companyEmployeeService=inject(CompanyEmployeeService);

  ngOnInit() {
    this.isLoggedIn=this.authService.isLoggedIn();
    this.isAppUser=this.authService.isAppUser();
    this.userId = this.accountService.currentUser()?.id;


    if(localStorage.getItem('mode') == 'dark-mode'){
      this.mode = 'dark-mode';
      this.switchClicked = true;
    }else{
      this.mode = 'light-mode';
      this.switchClicked = false;
    }

    if(this.isAppUser == false || this.isLoggedIn == false) {
      this.isOwner = false;
      this.isEmployee = false;

      console.log(this.isOwner,this.isEmployee);

      return;
    }

    this.companyEmployeeService.getCompanyAdminEmail(this.userId).subscribe({
      next: (response2) => {
        if(response2 != null){
          this.companyAdminEmail = response2;
          this.isOwner = true;
          this.isEmployee = false;
          return;
        }

        console.log("No company admin email found");
        this.isOwner = false;
        this.isEmployee = false;
        return;
      }
    });

    this.companyEmployeeService.getEmployeeForAdmin(this.userId).subscribe({
      next: (response) =>{
        if(response == null){
          return;
        }

        this.employee=response;

        if(this.employee.companyAdminEmail != null && this.employee.company.companyName == null){
          this.isOwner = true;
          this.isEmployee = false;
        }
        else if(this.employee.companyAdminEmail == null && this.employee.company.companyName != null)
        {
          this.isEmployee = true;
          this.isOwner = false;
        }
        else if(this.employee.companyAdminEmail != null && this.employee.company.companyName != null){
          this.isOwner = true;
          this.isEmployee = false;
        }
        else{
          this.isOwner = false;
          this.isEmployee = false;
        }
        console.log(this.isOwner,this.isEmployee);
      }
    })
  }

  switchClicked: boolean = false;
  mode: string = 'light-mode';
  isLoggedIn: boolean=false;
  isAppUser:boolean=false;
  isEmployee: boolean = false;
  isOwner: boolean = false;
  companyAdminEmail: any = null;
  employee: any = null;
  userId: any = 0 || null;

  toggleDarkMode() {
    this.switchClicked = !this.switchClicked;

    if (this.switchClicked) {
      this.mode = 'dark-mode';
      localStorage.setItem('mode', this.mode);
    } else {
      this.mode = 'light-mode';
      localStorage.setItem('mode', this.mode);
    }
  }
}
