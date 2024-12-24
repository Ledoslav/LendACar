import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UserDto} from '../Models/UserDto';
import {map} from 'rxjs';
import {PasswordReset} from '../Models/PasswordReset';
import {Router} from '@angular/router';
import {EmployeeFilter} from '../Models/EmployeeFilter';
import {UserFilter} from '../Models/UserFilter';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }
  private http=inject(HttpClient);
  private router=inject(Router);
  baseUrl:string="http://localhost:7000/api/";
  currentUser=signal<UserDto | null>(null)

  Login(model:any){
   return this.http.post<UserDto>(this.baseUrl+'user/login',model).pipe(
     map(user=>{
       if(user){
         localStorage.setItem('user',JSON.stringify(user));
         this.currentUser.set(user)
         console.log("Current user set:", this.currentUser());
         console.log("User service 1");
       }
       return user;
     })
   );
  }

  Register(model:any){
    return this.http.post(this.baseUrl+`user/register/`,model);
  }

  Update(model:any){
    console.log(model);
    return this.http.put<UserDto>(this.baseUrl+`user/update/${model.id}`,model).pipe(
      map(user=>{
        if(user){
          localStorage.clear();
          localStorage.setItem('user',JSON.stringify(user));
          this.currentUser.set(user)
          console.log("Current user set:", this.currentUser());
        }
        return user;
      })
    );
  }

  Delete(id:any){
    return this.http.delete<string>(this.baseUrl+`user/remove/${id}`)
  }

  ChangePassword(model:any){
    console.log(model);
    return this.http.put<any>(this.baseUrl+'resetpassword/change',model).subscribe({
      next:()=>{
        alert("Password change successful");
        localStorage.removeItem('user');
        void this.router.navigateByUrl("/user/dashboard");
        this.currentUser.set(null);
      },
      error:error=>{console.log(error)}
    })
  }

  GetUserById(id:number){
    return this.http.get<UserDto>(this.baseUrl + `user/getById/${id}`)
  }

  GetAllUsers(){
    return this.http.get<UserDto[]>(this.baseUrl+`user/getAll`)
  }

  // Getter to access current user
  getCurrentUser() {
    return this.currentUser();
  }

  FilterUsers(filter:UserFilter){
      let params=new HttpParams();

      if (filter.name) params = params.set('name', filter.name);
      if (filter.ageFrom) params = params.set('ageFrom', filter.ageFrom.toString());
      if(filter.ageTo) params = params.set('ageTo', filter.ageTo.toString());
      if(filter.cityId) params = params.set('cityId', filter.cityId.toString());
      if(filter.countryId) params = params.set('countryId', filter.countryId.toString());
      if(filter.isVerified){
        if(filter.isVerified=="Yes") {
         params=params.set('isVerified', "true");
        }else{
          params=params.set('isVerified', "false");
        }
      }
      console.log(params);

      return this.http.get<UserDto[]>(`${this.baseUrl}user/filter`,{params});
  }
}
