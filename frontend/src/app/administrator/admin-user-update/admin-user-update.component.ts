import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';

@Component({
  standalone: false,
  selector: 'app-admin-user-update',
  templateUrl: './admin-user-update.component.html',
  styleUrl: './admin-user-update.component.css'
})
export class AdminUserUpdateComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.userEditForm=this.fb.group({
      firstName: [undefined, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: [undefined, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      emailAddress: [undefined, [Validators.required, Validators.email, Validators.maxLength(100)]],
      username: [undefined, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      phoneNumber: [undefined, [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$"), Validators.maxLength(20)]],
      cityId: [undefined, Validators.required],
      countryId:[undefined, Validators.required],
      birthDate: [undefined, [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      isVerified:[false],
      isUserVerifiedStatusChanged: [false],
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
        this.userEditForm.get('isVerified')?.valueChanges.subscribe((value: boolean) => {
          if (this.originalIsVerified !== undefined && value !== this.originalIsVerified) {
            this.userEditForm.get('isUserVerifiedStatusChanged')?.setValue(true, { emitEvent: false });
          } else {
            this.userEditForm.get('isUserVerifiedStatusChanged')?.setValue(false, { emitEvent: false });
          }
        
    this.cdr.detectChanges();
  });
    }

    user:any;
    userEditForm:FormGroup;
    userService=inject(UserService)
    route=inject(ActivatedRoute);
    fb=inject(FormBuilder);
    cityService=inject(CityService);
    countryService=inject(CountryService);
    adminService=inject(AdminService);
    private snackBarService=inject(MySnackbarService);

  cities: City[]=[];
  filteredCities:City[]=[];
  countries:Country[]=[];
  datePipe=inject(DatePipe)
  originalIsVerified: boolean | undefined;

  formatDate() {
    this.user.birthDate = new Date(this.user.birthDate);
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
      error:err=>{}
    })
  }
    getUserById(idString:string){
      const id=Number.parseInt(idString);
      return this.userService.GetUserById(id).pipe(
        concatMap(user => {
          this.user = user;
          this.originalIsVerified = user.isVerified;
          this.formatDate();
          this.createForm();
          return this.userService.GetUserById(id);
        })
      );
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
        isUserVerifiedStatusChanged: false,
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

    if (userObject.birthDate) {
      userObject.birthDate=userObject.birthDate.toISOString().split('T')[0];
    }

    this.adminService.UpdateUser(userObject).subscribe({
      next:result => {
        this.snackBarService.showSuccessMessage("User Updated Successfully");
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      },
      error:err => {}
    })
  }
}
