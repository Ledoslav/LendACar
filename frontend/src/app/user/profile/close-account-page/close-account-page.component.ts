import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';
import {DialogConfirmComponent} from '../../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-close-account-page',
  templateUrl: './close-account-page.component.html',
  styleUrl: './close-account-page.component.css'
})
export class CloseAccountPageComponent {
  private cdr = inject(ChangeDetectorRef);

  accountService=inject(UserService);
  router=inject(Router);
  private dialog = inject(MatDialog);

  Delete() {
    this.accountService.Delete(this.accountService.currentUser()?.id).subscribe({
      next: result => {
        this.accountService.Logout();},
      error: err => {
        this.accountService.currentUser.set(null);
        localStorage.removeItem('user');
      }
    })
  }

  openMyConfirmDialog() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete your account',
        confirmButtonText: 'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.Delete()
      } else {
      }
    
    this.cdr.detectChanges();
  });
  }
}
