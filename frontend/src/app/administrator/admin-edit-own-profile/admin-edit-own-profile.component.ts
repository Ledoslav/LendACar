import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {City} from '../../Models/City';
import {CityService} from '../../services/city.service';
import {AdminService} from '../../services/administrator.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';

@Component({
  standalone: false,
  selector: 'app-admin-edit-own-profile',
  templateUrl: './admin-edit-own-profile.component.html',
  styleUrl: './admin-edit-own-profile.component.css'
})
export class AdminEditOwnProfileComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  cities: City[] = [];
  model: any = {};
  adminEditForm: FormGroup;
  
  private fb = inject(FormBuilder);
  private cityService = inject(CityService);
  private adminService = inject(AdminService);
  private snackBarService = inject(MySnackbarService);

  constructor() {
    this.adminEditForm = this.fb.group({
      id: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      emailAddress: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$"), Validators.maxLength(20)]],
      birthDate: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      cityId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cityService.GetAllCities().subscribe(res => {
      this.cities = res;
      const admin = this.adminService.currentAdmin();
      if (admin) {
        this.adminEditForm.patchValue({
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          username: admin.username,
          emailAddress: admin.emailAddress,
          phoneNumber: admin.phoneNumber,
          birthDate: admin.birthDate,
          cityId: admin.cityId
        });
      }
    
    this.cdr.detectChanges();
  });
  }

  Update() {
    if (this.adminEditForm.valid) {
      this.adminService.Update(this.adminEditForm.value).subscribe({
        next: result => {
          this.snackBarService.showSuccessMessage("Profile updated successfully!");
          window.location.reload();
        },
        error: err => {
          this.snackBarService.showErrorMessage("Failed to update profile.");
        }
      });
    }
  }
}
