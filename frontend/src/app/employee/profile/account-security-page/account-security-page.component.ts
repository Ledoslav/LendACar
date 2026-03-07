import {Component, inject, OnInit} from '@angular/core';
import {SecurityQuestion, SecurityQuestionService} from '../../../services/security-question.service';
import {AbstractControl, FormBuilder, ValidatorFn, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {PasswordResetService} from '../../../services/password-reset.service';
import {EmployeeService} from '../../../services/employee.service';
import {MySnackbarService} from '../../../services/snackbars/my-snackbar.service';

@Component({
  standalone: false,
  selector: 'app-account-security-page',
  templateUrl: './account-security-page.component.html',
  styleUrl: './account-security-page.component.css'
})
export class AccountSecurityPageComponent implements OnInit{
  model:any={};


  fb=inject(FormBuilder)
  employeeService=inject(EmployeeService);
  router=inject(Router);
  private passwordResetService=inject(PasswordResetService);


  ngOnInit(): void {

    this.changePasswordForm.controls['newPassword'].valueChanges.subscribe({
      next: value => {this.changePasswordForm.controls['repeatPassword'].updateValueAndValidity()}
    })
  }



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



  ChangePassword() {
    this.changePasswordForm.patchValue({
      emailAddress: this.employeeService.currentEmployee()?.emailAddress,
    })
    const passwordChangeModel={...this.changePasswordForm.value};
    delete passwordChangeModel.passwordShow
    console.log(passwordChangeModel);

    this.passwordResetService.ChangePassword(passwordChangeModel)
  }


}
