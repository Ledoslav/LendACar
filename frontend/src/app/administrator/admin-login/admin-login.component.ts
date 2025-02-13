import {Component, inject, OnInit} from '@angular/core';
import {AdminService} from '../../services/administrator.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent implements OnInit  {

  ngOnInit(): void {
      const admin=localStorage.getItem('administrator');
      if(admin){
        this.router.navigateByUrl('/admin/dashboard/home');
      }
    }


  passwordShow:boolean = false;

  adminService=inject(AdminService);
  model:any={};
  router=inject(Router);

  login(){
    this.adminService.Login(this.model).subscribe({
      next:res=>{
        alert("Admin login successfully!");
        void this.router.navigateByUrl('/admin/dashboard');
      },
      error:err=>{
        alert("Invalid login credentials");
        console.log(err);
      }
    })
  }
}
