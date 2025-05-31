import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {City} from '../../../Models/City';
import {Country} from '../../../Models/Country';
import {CountryService} from '../../../services/country.service';
import {UserService} from '../../../services/user.service';
import {CityService} from '../../../services/city.service';
import {Router} from '@angular/router';
import {MySnackbarService} from '../../../services/snackbars/my-snackbar.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit{
  constructor() {
    this.model = this.accountService.currentUser();
    console.log(this.model);

    this.userEditForm=this.fb.group({
      id: [this.model.id, Validators.required],
      firstName: [this.model.firstName, [Validators.required,Validators.minLength(2),Validators.maxLength(15)]],
      lastName: [this.model.lastName, [Validators.required,Validators.minLength(2),Validators.maxLength(25)]],
      username: [this.model.username, [Validators.required,Validators.minLength(2),Validators.maxLength(20)]],
      birthDate: [this.model.birthDate, Validators.required],
      emailAddress: [this.model.emailAddress, [Validators.required,Validators.email]],
      phoneNumber: [this.model.phoneNumber, [Validators.required,Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
      countryId: [this.model.city?.countryId, Validators.required],
      cityId: [this.model.cityId, Validators.required],
    })
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadCities();
    this.userEditForm.get('countryId')?.valueChanges.subscribe(val=>{
      this.FilterCities(val);
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
    console.log(updateUser);
    this.accountService.Update(updateUser).subscribe({
      next: result => {
        this.accountService.currentUser.set(result);
        this.snackBarService.showSuccessMessage("Profile updated successfully!");
      },
      error: err => console.log(err)
    })
  }


  loadCountries(){
    this.countryService.getAllCountries().subscribe({
      next:res=>this.countries=res,
      error:err=>console.log(err)
    })
  }

  loadCities(){
    this.cityService.GetAllCities().subscribe(res=>{
      this.cities = res;
      this.FilterCities(this.accountService.currentUser()?.city.countryId);
    })
  }


  FilterCities(countryId:any) {
    this.filteredCities=this.cities.filter(city=>city.countryId==countryId);
  }
}
