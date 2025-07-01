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
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';


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
    snackbar=inject(MySnackbarService);
    passwordShow: boolean=false;
    captchaSuccess:boolean=false;
    passwordSame: boolean = true;

  registrationForm=this.fb.group({
    personalInfo:this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)], [usernameAsyncValidator()]],
      birthDate: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
    }),
    contactDetails:this.fb.group({
      emailAdress: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$"), Validators.maxLength(20)]],
    }),
    address:this.fb.group({
      countryId: ['', Validators.required],
      cityId: ['', Validators.required],
    }),
    passwords:this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      repeatPassword: ['', [Validators.required, this.matchValues('password'), Validators.minLength(6), Validators.maxLength(100)]],
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


    this.model.securityQuestionId=null;


    this.accountService.Register(this.model).subscribe({
      next: result =>{
        this.snackbar.showSuccessMessage("User created successfully")
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

  ComparePassword() {
    if(this.passwords.get('password')?.value !== this.passwords.get('repeatPassword')?.value)
      this.passwordSame = false;
    else
      this.passwordSame = true;
  }

}


