import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {UserDto} from '../../Models/UserDto';
import {Router} from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  cities:City[]=[];
  model:any={};

  passwordShow: boolean=false;
  passwordSame: boolean=true;
  repeatPassword:any;
  passwordsModel:any={};

  ngOnInit(): void {
        this.cityService.GetAllCities().subscribe(res=>{
          this.cities = res;
          console.log(this.cities);
          this.model = this.accountService.currentUser();
        })
      }
  accountService=inject(UserService);
  cityService=inject(CityService);
  router=inject(Router);

  Update() {
    console.log("Ovo prije update");
    console.log(this.model);
    this.accountService.Update(this.model).subscribe({
      next: result => {console.log("Ovo je poslije"); console.log(result); window.location.reload();},
      error: err => console.log(err)
    })
  }

  Delete() {
    if(window.confirm("Are you sure you want to delete account?")){
        this.accountService.Delete(this.model).subscribe({
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
    console.log(this.passwordsModel);

    const passwordChangeModel={
      EmailAddress:this.model.emailAddress,
      CurrentPassword:this.passwordsModel.CurrentPassword,
      NewPassword:this.passwordsModel.NewPassword,
    }
    console.log(passwordChangeModel);
    this.accountService.ChangePassword(passwordChangeModel)
  }

  ComparePassword() {
    if(this.passwordsModel.NewPassword!==this.repeatPassword)
      this.passwordSame=false;
    else
      this.passwordSame=true;
  }
}
