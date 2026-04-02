import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {City} from '../../../Models/City';
import {Country} from '../../../Models/Country';
import {CountryService} from '../../../services/country.service';
import {UserService} from '../../../services/user.service';
import {CityService} from '../../../services/city.service';
import {Router} from '@angular/router';
import {MySnackbarService} from '../../../services/snackbars/my-snackbar.service';

@Component({
  standalone: false,
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit{
  private cdr = inject(ChangeDetectorRef);
  constructor() {
    this.model = this.accountService.currentUser();

    this.userEditForm=this.fb.group({
      id: [this.model.id, Validators.required],
      firstName: [this.model.firstName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: [this.model.lastName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: [this.model.username, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      birthDate: [this.model.birthDate, [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      emailAddress: [this.model.emailAddress, [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: [this.model.phoneNumber, [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$"), Validators.maxLength(20)]],
      countryId: [this.model.city?.countryId, Validators.required],
      cityId: [this.model.cityId, Validators.required],
    })
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadCities();
    this.userEditForm.get('countryId')?.valueChanges.subscribe(val=>{
      this.FilterCities(val);
    
    this.cdr.detectChanges();
  })
  }

  cities:City[]=[];
  model:any={};
  filteredCities:City[] = [];
  countries: Country[]=[];
  userEditForm:FormGroup;

  fb=inject(FormBuilder)
  countryService=inject(CountryService);
  accountService=inject(UserService);
  cityService=inject(CityService);
  router=inject(Router);
  snackBarService=inject(MySnackbarService)


  UpdateProfile() {
    let city=this.cities.find(c=>c.id==this.userEditForm.get('cityId')?.value)
    let updateUser={
      ...this.userEditForm.value,
      city:city
    };
    this.accountService.Update(updateUser).subscribe({
      next: result => {
        this.accountService.currentUser.set(result);
        this.snackBarService.showSuccessMessage("Profile updated successfully!");
      },
      error: err => {}
    })
  }


  loadCountries(){
    this.countryService.getAllCountries().subscribe({
      next:res=>this.countries=res,
      error:err=>{}
    })
  }

  loadCities(){
    this.cityService.GetAllCities().subscribe(res=>{
      this.cities = res;
      this.FilterCities(this.accountService.currentUser()?.city.countryId);
    
    this.cdr.detectChanges();
  })
  }


  FilterCities(countryId:any) {
    this.filteredCities=this.cities.filter(city=>city.countryId==countryId);
  }
}
