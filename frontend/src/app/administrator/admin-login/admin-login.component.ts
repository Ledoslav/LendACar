import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {AdminService} from '../../services/administrator.service';
import {Router} from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent implements OnInit  {
  private cdr = inject(ChangeDetectorRef);

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
        void this.router.navigateByUrl('/admin/dashboard');
      },
      error:err=>{
        console.log(err);
      }
    })
  }
}
