import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import {CompanyEmployeeService} from '../../services/companyemployee.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  accountService=inject(UserService);
  authService=inject(MyAuthServiceService);
  companyEmployeeService=inject(CompanyEmployeeService);

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn=this.authService.isLoggedIn();
    this.isAppUser=this.authService.isAppUser();

    this.userId = this.accountService.currentUser()?.id;

    if(this.isAppUser == false || this.isLoggedIn == false) {
      this.isOwner = false;
      this.isEmployee = false;
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
      }
    })
  }

  isLoggedIn: boolean=false;
  isAppUser:boolean=false;

  userId: any = 0 || null;
  employee: any = null;
  isEmployee: boolean = false;
  isOwner: boolean = false;
  companyAdminEmail: any = null;

  openSearch() {
    this.router.navigate(['/pretraga']);
  }
}
