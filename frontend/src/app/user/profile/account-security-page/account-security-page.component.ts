import {Component, inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {PasswordResetService} from '../../../services/password-reset.service';
import {SecurityQuestion, SecurityQuestionService} from '../../../services/security-question.service';
import {UserSecurityQuestionAnswerService} from '../../../services/user-security-question-answer.service';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-account-security-page',
  templateUrl: './account-security-page.component.html',
  styleUrl: './account-security-page.component.css'
})
export class AccountSecurityPageComponent implements OnInit{

  model:any={};
  questions:SecurityQuestion[]=[]

  fb=inject(FormBuilder)
  accountService=inject(UserService);
  router=inject(Router);
  private passwordResetService=inject(PasswordResetService);
  private securityQuestionService=inject(SecurityQuestionService);
  private userSecurityQuestionAnswerService=inject(UserSecurityQuestionAnswerService);

  ngOnInit(): void {

    this.loadSecurityQuestion();

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


  securityQuestionForm=this.fb.group({
    securityQuestionId:[0,Validators.required],
    questionAnswer: ['', Validators.required],
    currentPassword: ['',Validators.required],
  })


  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {isMatching: true}
    }
  }


  loadSecurityQuestion() {
    this.securityQuestionService.GetAllQuestions().subscribe(res => {
      this.questions = res;
      console.log(this.questions)
    })
  }



  ChangePassword() {
    this.changePasswordForm.patchValue({
      emailAddress: this.accountService.currentUser()?.emailAddress,
    })
    const passwordChangeModel={...this.changePasswordForm.value};
    delete passwordChangeModel.passwordShow
    console.log(passwordChangeModel);

    this.passwordResetService.ChangePassword(passwordChangeModel)
  }


  ChangeQuestion(){
    const userId=this.accountService.currentUser()?.id ?? 0 ;
    const changeQuestionModel={... this.securityQuestionForm.value};
    console.log(changeQuestionModel);
    if(confirm("Are you sure you want to change security questions?")){
      this.userSecurityQuestionAnswerService.ChangeSecurityQuestion(userId,changeQuestionModel).subscribe({
        next:res=>{
          alert("Question changed successfully")
          this.accountService.currentUser.set(null);
          localStorage.removeItem('user');
          localStorage.removeItem('auth-token');
          void this.router.navigateByUrl('/user/dashboard');
        },
        error:err=>console.log(err)
      })
    }
  }

  AddQuestion(){
    const userId=this.accountService.currentUser()?.id ?? 0 ;
    const changeQuestionModel={... this.securityQuestionForm.value};
    console.log(changeQuestionModel);
    this.userSecurityQuestionAnswerService.CreateAnswer(userId,changeQuestionModel).subscribe({
      next:res=>{
        alert("Security question added successfully");
        this.accountService.currentUser.set(null);
        localStorage.removeItem('user');
        localStorage.removeItem('auth-token');
        void this.router.navigateByUrl('/user/dashboard');
      },
      error:err=>console.log(err)
    })
  }

  RemoveQuestion(){
    const userId=this.accountService.currentUser()?.id ?? 0 ;
    const changeQuestionModel={... this.securityQuestionForm.value};
    if(confirm("Are you sure you want to remove security questions?")){
      this.userSecurityQuestionAnswerService.RemoveSecurityQuestion(userId,changeQuestionModel).subscribe({
        next:res=>{
          alert("Question removed successfully")
          this.accountService.currentUser.set(null);
          localStorage.removeItem('user');
          localStorage.removeItem('auth-token');
          void this.router.navigateByUrl('/user/dashboard');
        },
        error:err=>console.log(err)
      })
    }
  }

}
