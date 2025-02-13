import {inject, Injectable} from '@angular/core';
import {TokenObject} from '../../Models/auth-models/TokenObject';
import {AuthResponse} from '../../Models/auth-models/AuthResponse';
import {TokenClaims} from '../../Models/auth-models/TokenClaims';
import {Router} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class MyAuthServiceService {

  constructor() { }
  private router=inject(Router);
  private jwtHelper=inject(JwtHelperService);

  setLoggedInUser(response:AuthResponse){
    const decodedToken:TokenClaims|null=this.jwtHelper.decodeToken(response.token);
    if(!decodedToken){
      this.router.navigateByUrl('/login');
    }
    const tokenObject:TokenObject={
      token:response.token,
      claims:decodedToken,
    }
    localStorage.setItem('auth-token',JSON.stringify(tokenObject));
  }


  getMyAuthInfo(): TokenClaims | null {
    const tokenClaims:TokenClaims | null=this.getToken()?.claims ?? null;
    return tokenClaims;
  }


  getToken():TokenObject | null{
    const tokenString=localStorage.getItem('auth-token') ?? '';
    try{
      const parsedToken = JSON.parse(tokenString);
      return parsedToken;
    }
    catch(error){
      return null
    }
  }


  isLoggedIn(): boolean {
    if(this.getMyAuthInfo() != null  && this.getMyAuthInfo()?.isLoggedIn )
      return true;
    else
      return false;
  }

  isAdmin(): boolean {
    return this.getMyAuthInfo()?.isAdmin ?? false;
  }

  isEmployee(): boolean {
    return this.getMyAuthInfo()?.isEmployee ?? false;
  }

  isAppUser():boolean{
    return this.getMyAuthInfo()?.isAppUser ?? false;
  }

}
