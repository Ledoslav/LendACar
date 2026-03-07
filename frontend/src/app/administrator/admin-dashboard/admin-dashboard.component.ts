import { Component ,inject, OnInit } from '@angular/core';
import {AdminService} from '../../services/administrator.service';
import {Router} from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent{
}
