import {Component, inject, model, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {Router} from '@angular/router';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {CountryService} from '../../services/country.service';
import {Country} from '../../Models/Country';
import {HttpClient} from '@angular/common/http';
import {usernameAsyncValidator} from '../../validators/username-async-validator';
import {catchError, map, Observable, of} from 'rxjs';
import {SecurityQuestion, SecurityQuestionService} from '../../services/security-question.service';
import {StepperSelectionEvent} from '@angular/cdk/stepper';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
    ngOnInit(): void {
        this.loadCountries();
        this.loadCities();
        this.loadSecurityQuestion();
    }

    model:any = {};
    cities:City[]=[];
    filteredCities:City[]=[]
    countries:Country[]=[];
    questions:SecurityQuestion[]=[];
    httpClient=inject(HttpClient)
    accountService=inject(UserService);
    cityService=inject(CityService);
    countryService=inject(CountryService);
    private securityQuestionService=inject(SecurityQuestionService);
    router=inject(Router);
    fb=inject(FormBuilder);
    passwordShow: boolean=false;
    captchaSuccess:boolean=false;

  registrationForm=this.fb.group({
    personalInfo:this.fb.group({
      firstName: ['', [Validators.required,Validators.min(2),Validators.max(15)]],
      lastName: ['', [Validators.required,Validators.min(2),Validators.max(15)]],
      username: ['', [Validators.required,Validators.minLength(4),Validators.maxLength(20)],[usernameAsyncValidator()]],
      birthDate: ['', Validators.required],
    }),
    contactDetails:this.fb.group({
      emailAdress: ['', [Validators.required,Validators.email]],
      phoneNumber: ['', [Validators.required,Validators.pattern("^(\\+?[0-9][0-9\\s\\-\\(\\)]*)$")]],
    }),
    address:this.fb.group({
      countryId: ['', Validators.required],
      cityId: ['', Validators.required],
    }),
    passwords:this.fb.group({
      password: ['', Validators.required],
      repeatPassword: ['', [Validators.required,this.matchValues('password')]],
    }),
    securityQuestion:this.fb.group({
      securityQuestionId:[''],
      questionAnswer:[''],
    })
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
  get securityQuestion(): FormGroup {
    return this.registrationForm.get('securityQuestion') as FormGroup;
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

  loadSecurityQuestion(){
    this.securityQuestionService.GetAllQuestions().subscribe(res=>{
      this.questions=res;
      console.log(this.questions)
    })
}

showQuestions:boolean=true;
isSelectSecurityQuestionShown=false;
showJustCaptcha=false

  register() {
    this.model = {
      ...this.personalInfo.value,
      ...this.contactDetails.value,
      ...this.address.value,
      ...this.passwords.value,
      ...this.securityQuestion.value
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


  onStepChange(event: StepperSelectionEvent) {
    // If moving back to Step 1, reset its form
    if (event.previouslySelectedIndex > event.selectedIndex) {
      if (event.selectedIndex === 3) {
       this.showQuestions=false;
      }
    }
  }

  showSelectSecurityQuestion(){
    this.isSelectSecurityQuestionShown=!this.isSelectSecurityQuestionShown;
    this.showQuestions=!this.showQuestions;
  }

  showCaptcha(){
    this.showJustCaptcha=!this.showJustCaptcha;
    this.showQuestions=!this.showQuestions;
  }


}


