import {Component, inject, OnInit} from '@angular/core';
import {Activity, ActivityCreateRequest, ActivityService} from '../../services/activity-service';
import {UserService} from '../../services/user.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';

@Component({
  selector: 'app-activity-home',
  templateUrl: './activity-home.component.html',
  styleUrl: './activity-home.component.css'
})
export class ActivityHomeComponent implements OnInit{
  activities: Activity[] = [];
  loading = false;
  error: string | null = null;

  accountService = inject(UserService); // Inject UserService
  authService = inject(MyAuthServiceService);

  // Form fields for creating activity
  userId:any;
  vehicleId!: number;
  isAppUser: boolean = false;
  isLoggedIn: boolean = false;
  username:any;
  mode:string = 'light-mode';

  constructor(
    private activityService: ActivityService,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAppUser = this.authService.isAppUser();

    if (localStorage.getItem('mode') == 'dark-mode') {
      this.mode = 'dark-mode';
    } else {
      this.mode = 'light-mode';
    }

    if (this.isAppUser) {
      this.username = this.accountService.currentUser()?.username;
      this.userId = this.accountService.currentUser()?.id;
      this.loadActivities();
    }
  }

  /** Fetch activities from backend */
  loadActivities(): void {
    this.loading = true;
    this.error = null;
    this.activityService.getAll(this.userId).subscribe({
      next: activities => {
        this.activities = activities;
        this.loading = false;
        console.log(this.activities);
      },
      error: err => console.error("Failed to load activities", err)
    });
  }
}
