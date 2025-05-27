import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {City} from '../../../Models/City';
import {Country} from '../../../Models/Country';
import {CountryService} from '../../../services/country.service';
import {CityService} from '../../../services/city.service';
import {Router} from '@angular/router';
import {MySnackbarService} from '../../../services/snackbars/my-snackbar.service';
import {EmployeeService} from '../../../services/employee.service';
import {EmployeeDto} from '../../../Models/EmployeeDto';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent{
  constructor() {
    this.model = this.employeeService.currentEmployee()!;

    this.employeeEditForm=this.fb.group({
      id: [this.model.id, Validators.required],
      firstName: [this.model.firstName, [Validators.required,Validators.minLength(2),Validators.maxLength(15)]],
      lastName: [this.model.lastName, [Validators.required,Validators.minLength(2),Validators.maxLength(25)]],
      username: [this.model.username, [Validators.required,Validators.minLength(2),Validators.maxLength(20)]],
      birthDate: [this.model.birthDate, Validators.required],
      emailAddress: [this.model.emailAddress, [Validators.required,Validators.email]],
      phoneNumber: [this.model.phoneNumber, [Validators.required,Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
      countryId: [this.model.city?.country.name, Validators.required],
      cityId: [this.model.city.name, Validators.required],
    })
  }

  model:EmployeeDto;
  employeeEditForm:FormGroup;

  fb=inject(FormBuilder)
  employeeService=inject(EmployeeService);
  router=inject(Router);
  snackBarService=inject(MySnackbarService)


  UpdateProfile() {

    let updateUser={
      ...this.employeeEditForm.value,
      cityId:this.employeeService.currentEmployee()?.cityId,
      countryId:this.employeeService.currentEmployee()?.city.countryId
    };

    console.log(updateUser);
    this.employeeService.Update(updateUser).subscribe({
      next: result => {
        this.employeeService.currentEmployee.set(result);

        this.snackBarService.showSuccessMessage("Profile updated successfully!");
      },
      error: err => console.log(err)
    })
  }


}
