/*
import { Component, OnInit, inject } from '@angular/core';
import { CityService } from '../../services/city.service';
import { CountryService } from '../../services/country.service';
import { UserService } from '../../services/user.service';
import { VehicleListingService } from '../../services/vehiclelisting.service';
import { Router } from '@angular/router';
import { City } from '../../Models/City';
import { Country } from '../../Models/Country';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-vehicle-upload',
  templateUrl: './vehicle-upload.component.html',
  styleUrls: ['./vehicle-upload.component.css']
})
export class VehicleUploadComponent implements OnInit {
  ngOnInit(): void {
          this.loadCountries();
          this.loadCities();
      }

     model:any = {};
      cities:City[]=[];
      filteredCities:City[]=[]
      countries:Country[]=[];
      httpClient=inject(HttpClient)
    accountService=inject(UserService);
    cityService=inject(CityService);
    countryService=inject(CountryService)
    router=inject(Router);
    fb=inject(FormBuilder);
    passwordShow: boolean=false;
    captchaSuccess:boolean=false;

    vehicleUploadForm=this.fb.group({
      basicInfo:this.fb.group({
        firstName: ['', [Validators.required,Validators.min(2),Validators.max(15)]],
        lastName: ['', [Validators.required,Validators.min(2),Validators.max(15)]],
        username: ['', [Validators.required,Validators.min(5),Validators.max(20)]],
        birthDate: ['', Validators.required],
      }),
      technicalDetails:this.fb.group({
        emailAdress: ['', [Validators.required,Validators.email]],
        phoneNumber: ['', [Validators.required,Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
      }),
      description:this.fb.group({
        countryId: ['', Validators.required],
        cityId: ['', Validators.required],
      }),
      images:this.fb.group({
        password: ['', Validators.required],
        repeatPassword: ['', [Validators.required,this.matchValues('password')]],
      }
      ),
    });


    matchValues(matchTo: string): ValidatorFn {
      return (control: AbstractControl) => {
        return control.value === control.parent?.get(matchTo)?.value ? null : {isMatching: true}
      }
    }

    UpdateRepeatPasswordValidity(){
      this.passwords.controls['password'].valueChanges.subscribe({
        next: value => {this.passwords.controls['repeatPassword'].updateValueAndValidity()}
      })
    }



    get basicInfo(): FormGroup {
      return this.vehicleUploadForm.get('basicInfo') as FormGroup;
    }
    get contactDetails(): FormGroup {
      return this.vehicleUploadForm.get('technicalDetails') as FormGroup;
    }
    get address(): FormGroup {
      return this.vehicleUploadForm.get('description') as FormGroup;
    }
    get passwords(): FormGroup {
      return this.vehicleUploadForm.get('images') as FormGroup;
    }





    loadCountries(){
      this.countryService.getAllCountries().subscribe(res=>{
          this.countries=res;
        })
    }

    loadCities(){
      this.cityService.GetAllCities().subscribe(res=>{
        this.cities = res;
      })
    }


    register() {
      this.model = {
        ...this.basicInfo.value,
        ...this.contactDetails.value,
        ...this.address.value,
        ...this.passwords.value,
      };

      console.log(this.model);


      this.accountService.Register(this.model).subscribe({
        next: result =>{
          alert("User created successfully");
          console.log(result)
          void this.router.navigateByUrl('/user/login');
        },
        error: err => console.log(err)
      })
    }


    FilterCities($event:any) {
      let countryId=$event.target.value;
        this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
    }

    handleSuccess(token: string) {
      console.log(token)

      const obj={
        ResponseToken:token
      }

      this.httpClient.post("http://localhost:7000/api/Captcha/verify",obj ).subscribe({
        next: result => {
          this.captchaSuccess=true;
        },
        error: err => {console.log(err)},
      })
    }
}
*/
