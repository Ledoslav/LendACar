import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {PasswordReset} from '../Models/PasswordReset';
import {PasswordResetService} from '../services/password-reset.service';
import {UserSecurityQuestionAnswerService} from '../services/user-security-question-answer.service';
import {UserSecurityQuestionAnswerDto} from '../Models/UserSecurityQuestionAnswerDto';
import {SecurityQuestion, SecurityQuestionService} from '../services/security-question.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent  {

  model:PasswordReset= {
    emailAddress:"",
    currentPassword:"",
    newPassword:"",
    resetToken:""
  };

  userSecurityQuestionAnswer:UserSecurityQuestionAnswerDto={
    securityQuestionId:0,
    questionAnswer:"",
  };

  passwordShow: boolean=false;
  repeatPassword:any;
  private passwordResetService=inject(PasswordResetService);
  private userSecurityQuestionAnswerService=inject(UserSecurityQuestionAnswerService)
  private securityQuestionService=inject(SecurityQuestionService);
  passwordSame: boolean=true;
  baseUrl:string="http://localhost:7000/api/";

  questions:SecurityQuestion[]=[];
  isEmailSent:boolean=false;
  isTokenValid:boolean=false;
  hasUserQuestion:boolean=false;
  isAnswerGood:boolean=false;
  showResendToken:boolean=true;

  questionId:number=0;

  ResetPassword(){
    const passwordChangeModel={
      EmailAddress:this.model.emailAddress,
      CurrentPassword:" ",
      NewPassword:this.model.newPassword,
      ResetToken:this.model.resetToken,
    }

    console.log(passwordChangeModel);


    if(this.passwordSame){
      this.passwordResetService.ResetPassword(passwordChangeModel);
    }
    else
      alert("Passwords must match");

  }

  SendResetToken(){
    const object={
      EmailTo:this.model.emailAddress
    }

    this.userSecurityQuestionAnswerService.HasUserQuestion(this.model.emailAddress).subscribe({
      next:result=>{
        if(result.hasSecurityQuestion){
          this.hasUserQuestion=true;
          this.userSecurityQuestionAnswer.securityQuestionId=result.questionText
          this.loadSecurityQuestion();
        }
        else {
          this.passwordResetService.SendResetToken(object).subscribe({
            next:result=>{
              alert("Verification code is sent");
              this.isEmailSent=result.isSent
            },
            error:err => console.log(err)
          })
        }
      }
    })
  }

  ValidateToken(){
    const object={
      EmailTo:this.model.emailAddress,
      ResetToken:this.model.resetToken,
    }
    this.passwordResetService.ValidatePasswordToken(object).subscribe({
      next:result=>{
        if(result.isValidToken){
          alert("Verification code is valid");
        }
        this.isTokenValid=result.isValidToken
        this.showResendToken=result.isValidToken
      },
      error:err => {
        console.log(err)
      }
    })
  }

SubmitAnswer(){
  const object={
    EmailTo:this.model.emailAddress
  }

  this.userSecurityQuestionAnswerService.SubmitAnswer(this.model.emailAddress,this.userSecurityQuestionAnswer).subscribe({
    next:result=>{
      this.isAnswerGood=result.isAnswerGood;
      if(result.isAnswerGood){
        this.passwordResetService.SendResetToken(object).subscribe({
          next:result=>{
            alert("Verification code is sent");
            this.isEmailSent=result.isSent
          },
          error:err => console.log(err)
        })
      }
    }
  })
}


  loadSecurityQuestion() {
    this.securityQuestionService.GetAllQuestions().subscribe(res => {
      this.questions = res;
      console.log(this.questions)
    })
  }

  ComparePassword() {
    if(this.model.newPassword!==this.repeatPassword)
      this.passwordSame=false;
    else
      this.passwordSame=true;
  }

}
