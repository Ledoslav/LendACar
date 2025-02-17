import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Country} from '../../Models/Country';
import {CountryService} from '../../services/country.service';
import {PasswordResetService} from '../../services/password-reset.service';


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {

  constructor() {
    this.model = this.accountService.currentUser();
    console.log(this.model);

   this.userEditForm=this.fb.group({
     id: [this.model.id, Validators.required],
      firstName: [this.model.firstName, [Validators.required,Validators.min(2),Validators.max(15)]],
      lastName: [this.model.lastName, [Validators.required,Validators.min(2),Validators.max(25)]],
      username: [this.model.username, [Validators.required,Validators.min(5),Validators.max(20)]],
      birthDate: [this.model.birthDate, Validators.required],
      emailAddress: [this.model.emailAddress, [Validators.required,Validators.email]],
      phoneNumber: [this.model.phoneNumber, [Validators.required,Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
      countryId: [this.model.city?.countryId, Validators.required],
      cityId: [this.model.cityId, Validators.required],
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
  private passwordResetService=inject(PasswordResetService);


  //passwordShow: boolean=false;

  changePasswordForm=this.fb.group({
    currentPassword:['',Validators.required],
    newPassword: ['', Validators.required],
    repeatPassword: ['', [Validators.required,this.matchValues('newPassword')]],
    passwordShow:[false],
    emailAddress: '',
  })

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {isMatching: true}
    }
  }


  ngOnInit(): void {

    this.loadCountries();
    this.loadCities();

    this.userEditForm.get('countryId')?.valueChanges.subscribe(val=>{
      this.FilterCities(val);
    })

    this.changePasswordForm.controls['newPassword'].valueChanges.subscribe({
      next: value => {this.changePasswordForm.controls['repeatPassword'].updateValueAndValidity()}
    })

  }


  Update() {;
    console.log(this.userEditForm.value);
    this.accountService.Update(this.userEditForm.value).subscribe({
      next: result => {
        this.accountService.currentUser.set(result)
        alert("User updated successfully");
      },
      error: err => console.log(err)
    })
  }

  Delete() {
    if(window.confirm("Are you sure you want to delete account?")){
        this.accountService.Delete(this.userEditForm.get('id')?.value).subscribe({
          next: result => {
            console.log(result);
            this.accountService.currentUser.set(null);
            localStorage.removeItem('user');
            void this.router.navigateByUrl('/user/dashboard');
          },
          error: err => {
            console.log(err);
            this.accountService.currentUser.set(null);
            localStorage.removeItem('user');
          }
      })
    }
  }

  ChangePassword() {
    this.changePasswordForm.patchValue({
      emailAddress: this.userEditForm.get('emailAddress')?.value,
    })
    const passwordChangeModel={...this.changePasswordForm.value};
    delete passwordChangeModel.passwordShow
    console.log(passwordChangeModel);

    this.passwordResetService.ChangePassword(passwordChangeModel)
    //this.accountService.ChangePassword(passwordChangeModel)
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
       console.log(this.userEditForm.value);
    })
  }


FilterCities(countryId:any) {
      console.log(countryId);
      this.filteredCities=this.cities.filter(city=>city.countryId==countryId);
      console.log("Filtered cities")
      console.log(this.filteredCities);
  }

}
