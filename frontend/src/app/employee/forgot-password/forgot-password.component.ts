import {Component, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  model:any={};
  passwordShow: boolean=false;
  repeatPassword:any;
  private http=inject(HttpClient);
  passwordSame: boolean=true;
  baseUrl:string="http://localhost:7000/api/";
  private router=inject(Router);

  ResetPassword(){
    const passwordChangeModel={
      EmailAddress:this.model.EmailAddress,
      CurrentPassword:" ",
      NewPassword:this.model.NewPassword,
    }

    console.log(passwordChangeModel);

    this.http.put<any>(this.baseUrl+'resetpassword/reset',passwordChangeModel).subscribe({
      next:result=>{
        console.log(result.userType);
        alert("Password reset successful");
        this.router.navigateByUrl(`/${result.userType}/login`);
      },
      error:error=>{console.log(error)}
    })
  }


  ComparePassword() {
    if(this.model.NewPassword!==this.repeatPassword)
      this.passwordSame=false;
    else
      this.passwordSame=true;
  }
}
