import { Component, inject, model, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { MyConfig } from '../../my-config';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
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
      
    this.cdr.detectChanges();
  })
  }

  loadCities(){
    this.cityService.GetAllCities().subscribe(res=>{
      this.cities = res;
    
    this.cdr.detectChanges();
  })
  }

  loadSecurityQuestion(){
    this.securityQuestionService.GetAllQuestions().subscribe(res=>{
      this.questions=res;
    
    this.cdr.detectChanges();
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

    // Format birthDate to yyyy-MM-dd if it exists
    if (this.model.birthDate) {
      const date = new Date(this.model.birthDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      this.model.birthDate = `${yyyy}-${mm}-${dd}`;
    }

    this.model.securityQuestionId=null;

    this.accountService.Register(this.model).subscribe({
      next: result =>{
        this.snackbar.showSuccessMessage("User created successfully")
        void this.router.navigateByUrl('/user/login');
      },
      error: err => {}
    })
  }


  FilterCities($event:any) {
    let countryId=this.address.get('countryId')?.value
    this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
  }

  handleSuccess(token: string) {

    const obj={
      ResponseToken:token
    }

    this.httpClient.post(MyConfig.api_address + "Captcha/verify",obj ).subscribe({
      next: result => {
        this.captchaSuccess=true;
      },
      error: err => {},
    })
  }


  onStepChange(event: StepperSelectionEvent) {

    if (event.selectedIndex === 4) {
      this.showQuestions = true;
      this.showJustCaptcha = false;
      this.isSelectSecurityQuestionShown = false;
    }

    if (event.previouslySelectedIndex > event.selectedIndex) {
      if (event.selectedIndex === 3) {
        this.showQuestions = false;
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


