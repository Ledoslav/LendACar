import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AdministratorDto} from '../Models/AdministratorDto';
import {map} from 'rxjs';
import {EmployeeDto} from '../Models/EmployeeDto';
import {AuthResponse} from '../Models/auth-models/AuthResponse';
import {MyAuthServiceService} from './auth-service/my-auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor() { }

  private http=inject(HttpClient);
  private myAuthService=inject(MyAuthServiceService)
  baseUrl:string="http://localhost:7000/api/";
  currentAdmin=signal<AdministratorDto | null>(null)

  Login(model:any){
    return this.http.post<AuthResponse>(this.baseUrl+'administrator/login',model).pipe(
      map(response=>{
        if(response){
          this.myAuthService.setLoggedInUser(response)
          const { token, ...administrator } = response;
          localStorage.setItem('administrator',JSON.stringify(administrator));
          this.currentAdmin.set(administrator);
        }
        return response;
      })
    )
  }

  Update(model:any){
    console.log(model);
    return this.http.put<AdministratorDto>(this.baseUrl+`administrator/update/${model.id}`,model).pipe(
      map(admin=>{
        if(admin){
          localStorage.clear();
          localStorage.setItem('administrator',JSON.stringify(admin));
          this.currentAdmin.set(admin)
          console.log("Current administrator set:", this.currentAdmin());
        }
        return admin;
      })
    );
  }

  UpdateUser(model:any){
    return this.http.put<EmployeeDto>(this.baseUrl+`user/update/${model.id}`,model);
  }

  UpdateEmployee(model: any) {
    return this.http.put<EmployeeDto>(this.baseUrl+`employee/update/${model.id}`,model)
  }
}
