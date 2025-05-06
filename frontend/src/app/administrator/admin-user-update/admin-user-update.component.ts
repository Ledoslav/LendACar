import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Country} from '../../Models/Country';
import {City} from '../../Models/City';
import {CityService} from '../../services/city.service';
import {CountryService} from '../../services/country.service';
import {DatePipe} from '@angular/common';
import {AdminService} from '../../services/administrator.service';
import {concatMap, Observable} from 'rxjs';

@Component({
  selector: 'app-admin-user-update',
  templateUrl: './admin-user-update.component.html',
  styleUrl: './admin-user-update.component.css'
})
export class AdminUserUpdateComponent implements OnInit {

  constructor() {
    this.userEditForm=this.fb.group({
      firstName: [undefined,Validators.required],
      lastName: [undefined,Validators.required],
      emailAddress: [undefined,[Validators.required,Validators.email]],
      username: [undefined,Validators.required],
      phoneNumber: [undefined,[Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
      cityId: [undefined,Validators.required],
      countryId:[undefined,Validators.required],
      birthDate: [undefined,Validators.required],
      isVerified:[undefined,Validators.required],
    });
  }

  ngOnInit(): void {
        const IdString=this.route.snapshot.queryParamMap.get('id');
        this.loadCountries();
        if(IdString){
          this.getCitiesAndUsers(IdString).subscribe({
              next: result => {
                this.user = result;
                this.formatDate();
                this.createForm();
              }
            }
          )
        }
    }

    user:any;
    userEditForm:FormGroup;
    userService=inject(UserService)
    route=inject(ActivatedRoute);
    fb=inject(FormBuilder);
    cityService=inject(CityService);
    countryService=inject(CountryService);
    adminService=inject(AdminService);

  cities: City[]=[];
  filteredCities:City[]=[];
  countries:Country[]=[];
  datePipe=inject(DatePipe)

  formatDate(){
    this.user.birthDate=this.datePipe.transform(Date.parse(this.user.birthDate),"yyyy-MM-dd");
  }

  getCitiesAndUsers(userId:string):Observable<any>{
    return this.cityService.GetAllCities().pipe(
      concatMap(cities=>{
        this.cities=cities;
        return this.getUserById(userId);
      })
    )
  }


  loadCountries(){
    this.countryService.getAllCountries().subscribe({
      next:res=>this.countries=res,
      error:err=>console.log(err)
    })
  }
    getUserById(idString:string){
      const id=Number.parseInt(idString);
      return this.userService.GetUserById(id);
    }
    createForm(){
      this.userEditForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        emailAddress: this.user.emailAddress,
        username: this.user.username,
        phoneNumber: this.user.phoneNumber,
        cityId:this.user.cityId,
        countryId:this.user.city.countryId,
        birthDate: this.user.birthDate,
        isVerified: this.user.isVerified,
      });
      this.FilterCities(undefined,this.user.city.countryId);
    }

  FilterCities($event?:any,country?:number) {
    let countryId:number;

    if(country){
      countryId=country;
      this.filteredCities=this.cities.filter(city=>city.countryId==country)
    }
    else{
      countryId=Number.parseInt($event.target.value);
      this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
    }
  }

  UpdateUser() {
    let userObject={...this.userEditForm.value};
    userObject.id=this.user.id;
    this.adminService.UpdateUser(userObject).subscribe({
      next:result => {
        alert("User Updated Successfully");
        window.location.reload();
      },
      error:err => console.log(err)
    })
  }
}
