import {Component, inject, OnInit} from '@angular/core';
import {AdminService} from '../../services/administrator.service';
import {HttpClient} from '@angular/common/http';
import {DashboardTotalCountsDto, UserCountByMonth} from '../../Models/DashboardTotalCountsDto';
import {Chart, registerables} from 'chart.js';

@Component({
  standalone: false,
  selector: 'app-admin-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
      Chart.register(...registerables);
      this.LoadDashboardData();
  }
  adminService=inject(AdminService);
  dashboardData:DashboardTotalCountsDto={
    userCount:0,
    employeeCount:0,
    vehicleCount:0,
    userCountByMonth:[]
  };
  private lineChartInstance1: Chart | null = null;

  LoadDashboardData(){
    this.adminService.GetDashboardData().subscribe(data=>{
      this.dashboardData=data;
      this.initialiseLineCharts();
    })
  }

  initialiseLineCharts() {
    const ctx1 = (document.getElementById('myLineChart') as HTMLCanvasElement)?.getContext('2d')!;

    const months = this.dashboardData.userCountByMonth.map(item => String(item.monthName));

    this.lineChartInstance1 = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'User Count',
          data: this.dashboardData.userCountByMonth.map(item => item.userCount),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          },
          title: {
            color: '#fff'
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#fff'
            },
            grid: {
              color: '#888'
            }
          },
          y: {
            ticks: {
              color: '#fff'
            },
            grid: {
              color: '#888'
            }
          }
        }
      }
    });

  }

}
