import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-my-vehicles-page',
  templateUrl: './my-vehicles-page.component.html',
  styleUrl: './my-vehicles-page.component.css'
})
export class MyVehiclesPageComponent {
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['Denis', Validators.required],
      lastName: ['Kundo', Validators.required],
      email: ['deni.kundo@edu.fri.ba', [Validators.required, Validators.email]],
      username: ['Denis123', Validators.required],
      phoneNumber: ['062-225-663', Validators.required],
      location: ['Scorpion, Bonfia and Transportation', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.profileForm.valid) {
      console.log('Profile updated:', this.profileForm.value);
      alert('Profile updated successfully!');
    } else {
      alert('Please fill out all fields correctly.');
    }
  }
}
