import {Component, inject, model, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CountryService} from '../../services/country.service';
import {Country} from '../../Models/Country';
import {passwordMatchValidator} from './PasswrodMatchValidator';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
    ngOnInit(): void {
        this.loadCountries();
        this.loadCities();
    }

   model:any = {};
    cities:City[]=[];
    filteredCities:City[]=[]
    countries:Country[]=[];
  accountService=inject(UserService);
  cityService=inject(CityService);
  countryService=inject(CountryService)
  router=inject(Router);
  fb=inject(FormBuilder);
  passwordShow: boolean=false;
  passwordCheck:any;
  passwordSame:boolean=true;

  registrationForm=this.fb.group({
    personalInfo:this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      birthDate: ['', Validators.required],
    }),
    contactDetails:this.fb.group({
      emailAdress: ['', [Validators.required,Validators.email]],
      phoneNumber: ['', [Validators.required,Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
    }),
    address:this.fb.group({
      countryId: ['', Validators.required],
      cityId: ['', Validators.required],
    }),
    passwords:this.fb.group({
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




  get personalInfo(): FormGroup {
    return this.registrationForm.get('personalInfo') as FormGroup;
  }
  get contactDetails(): FormGroup {
    return this.registrationForm.get('contactDetails') as FormGroup;
  }
  get address(): FormGroup {
    return this.registrationForm.get('address') as FormGroup;
  }
  get passwords(): FormGroup {
    return this.registrationForm.get('passwords') as FormGroup;
  }


  test(){

    this.model = {
      ...this.personalInfo.value,
      ...this.contactDetails.value,
      ...this.address.value,
      ...this.passwords.value,
    };

    console.log(this.model)

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
      ...this.personalInfo.value,
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

  ComparePassword() {
      if(this.model.Password!==this.passwordCheck)
        this.passwordSame=false;
      else
        this.passwordSame=true;
  }


  FilterCities($event:any) {
    let countryId=$event.target.value;
      this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
  }

}


