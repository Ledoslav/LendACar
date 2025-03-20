import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UserDto} from '../Models/UserDto';
import {map, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {UserFilter} from '../Models/UserFilter';
import {City} from '../Models/City';
import {JwtHelperService} from '@auth0/angular-jwt';
import {AuthResponse} from '../Models/auth-models/AuthResponse';
import {TokenClaims} from '../Models/auth-models/TokenClaims';
import {TokenObject} from '../Models/auth-models/TokenObject';
import {MyAuthServiceService} from './auth-service/my-auth-service.service';


@Injectable({
  providedIn: 'root'
})


export class UserService {

  constructor() { }
  private http=inject(HttpClient);
  private router=inject(Router);
  private jwtHelper=inject(JwtHelperService);
  private myAuthService=inject(MyAuthServiceService)
  baseUrl:string="http://localhost:7000/api/";
  currentUser=signal<UserDto | null>(null)

  Login(model:any){
   return this.http.post<AuthResponse>(this.baseUrl+'user/login',model).pipe(
     map(response=>{
       if(response){
         this.myAuthService.setLoggedInUser(response)
         const { token, ...user } = response;
         localStorage.setItem('user', JSON.stringify(user));
         this.currentUser.set(user);
         console.log("Current user set:", this.currentUser());
       }
       return response;
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
          localStorage.removeItem('user');
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
        localStorage.removeItem('auth-token')
        void this.router.navigateByUrl("/user/dashboard");
        this.currentUser.set(null);
      },
      error:error=>{console.log(error)}
    })
  }

  GetUserById(id:number){
    return this.http.get<UserDto>(this.baseUrl + `user/getById/${id}`)
  }

  GetAllUsers(pageNumber?:number,pageSize?:number){
    let params = new HttpParams();
    if(pageNumber&&pageSize){
      params = params.set('pageNumber',pageNumber);
      params=params.set('pageSize',pageSize);
    }

    return this.http.get<UserDto[]>(this.baseUrl+`user/getAll`,{observe:'response',params:params})
  }

  // Getter to access current user
  getCurrentUser() {
    return this.currentUser();
  }

  FilterUsers(filter:UserFilter,pageNumber?:number,pageSize?:number){
      let params=new HttpParams();

      console.log(filter);

      if (filter.name) params = params.set('name', filter.name);
      if (filter.ageFrom) params = params.set('ageFrom', filter.ageFrom.toString());
      if(filter.ageTo) params = params.set('ageTo', filter.ageTo.toString());
      if(filter.cityId) params = params.set('cityId', filter.cityId.toString());
      if(filter.countryId) params = params.set('countryId', filter.countryId.toString());
      if(filter.isVerified!="Verified users"){
        if(filter.isVerified=="Yes") {
         params=params.set('isVerified', "true");
        }else{
          params=params.set('isVerified', "false");
        }
      }
      if(pageNumber && pageSize){
        params = params.set('pageSize',pageSize);
        params=params.set('pageNumber',pageNumber);
      }
      console.log(params);

      return this.http.get<UserDto[]>(`${this.baseUrl}user/filter`,{observe:'response',params});
  }

  CheckUsernameAvailability(username:string):Observable<boolean>
  {
    const object={
      username:username
    }
    console.log(object);
    return this.http.post<{ isTaken: boolean }>(this.baseUrl+'Validator/check-username',object)
      .pipe(map(response => {
        console.log("Server response",response);
        return response.isTaken
      }
      ));
  }
}
