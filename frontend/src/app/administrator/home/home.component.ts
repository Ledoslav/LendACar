import {Component, inject, OnInit} from '@angular/core';
import {AdminService} from '../../services/administrator.service';
import {HttpClient} from '@angular/common/http';
import {DashboardTotalCountsDto} from '../../Models/DashboardTotalCountsDto';

@Component({
  selector: 'app-admin-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
      this.LoadDashboardData();
  }
  adminService=inject(AdminService);
  dashboardData!:DashboardTotalCountsDto;

  LoadDashboardData(){
    this.adminService.GetDashboardData().subscribe(data=>{
      this.dashboardData=data;
    })
  }

}
