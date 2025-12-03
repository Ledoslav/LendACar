import { Component, inject, OnInit } from '@angular/core';
import { Activity, ActivityService } from '../../services/activity-service';
import { UserService } from '../../services/user.service';
import { MyAuthServiceService } from '../../services/auth-service/my-auth-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-activity-home',
  templateUrl: './activity-home.component.html',
  styleUrls: ['./activity-home.component.css']
})
export class ActivityHomeComponent implements OnInit {
  activities: Activity[] = [];
  loading = false;
  error: string | null = null;

  accountService = inject(UserService);
  authService = inject(MyAuthServiceService);

  userId: any;
  vehicleId!: number;
  isAppUser: boolean = false;
  isLoggedIn: boolean = false;
  username: any;
  mode: string = 'light-mode';

  constructor(
    private activityService: ActivityService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAppUser = this.authService.isAppUser();

    this.mode = localStorage.getItem('mode') === 'dark-mode' ? 'dark-mode' : 'light-mode';

    if (this.isAppUser) {
      this.username = this.accountService.currentUser()?.username;
      this.userId = this.accountService.currentUser()?.id;
      this.loadActivities();
    }
  }

  loadActivities(): void {
    this.loading = true;
    this.error = null;
    this.activityService.getAll(this.userId).subscribe({
      next: (activities) => {
        this.activities = activities;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load activities', err);
        this.loading = false;
        this.error = 'Failed to load activities.';
      }
    });
  }

  clearAllActivities(): void {
    const snackRef = this.snackBar.open('Delete all activities?', 'Yes', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: this.mode === 'dark-mode' ? ['snackbar-dark'] : ['snackbar-light']
    });

    snackRef.onAction().subscribe(() => {
      this.activityService.deleteById(this.userId).subscribe({})
      this.activities = [];

      this.snackBar.open('All activities deleted.', 'OK', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: this.mode === 'dark-mode' ? ['snackbar-dark'] : ['snackbar-light']
      });
    });
  }
}
