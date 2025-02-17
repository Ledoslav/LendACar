import {Component, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {PasswordReset} from '../Models/PasswordReset';
import {PasswordResetService} from '../services/password-reset.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  model:PasswordReset= {
    emailAddress:"",
    currentPassword:"",
    newPassword:"",
    resetToken:""
  };

  passwordShow: boolean=false;
  repeatPassword:any;
  private http=inject(HttpClient);
  private router=inject(Router);
  private passwordResetService=inject(PasswordResetService);
  passwordSame: boolean=true;
  baseUrl:string="http://localhost:7000/api/";

  isEmailSent:boolean=false;
  emailForToken:string="";
  isTokenValid:boolean=false;

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
    this.passwordResetService.SendResetToken(object).subscribe({
      next:result=>{
        alert("Verification code is sent");
        this.isEmailSent=result.isSent
      },
      error:err => console.log(err)
    })
  }

  ValidateToken(){
    const object={
      EmailTo:this.model.emailAddress,
      ResetToken:this.model.resetToken,
    }
    this.passwordResetService.ValidatePasswordToken(object).subscribe({
      next:result=>{
        alert("Verification code is valid");
        this.isTokenValid=result.isValidToken
      },
      error:err => console.log(err)
    })

  }


  ComparePassword() {
    if(this.model.newPassword!==this.repeatPassword)
      this.passwordSame=false;
    else
      this.passwordSame=true;
  }

}
