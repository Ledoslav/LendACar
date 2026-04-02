import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {EmployeeDto} from '../Models/EmployeeDto';
import {map} from 'rxjs';
import {Router} from '@angular/router';
import {EmployeeFilter} from '../Models/EmployeeFilter';
import {MyAuthServiceService} from './auth-service/my-auth-service.service';
import {AuthResponse} from '../Models/auth-models/AuthResponse';
import {buildHttpParams} from '../helper/http-params.helper';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor() { }

  private http=inject(HttpClient);
  private baseUrl = MyConfig.api_address + 'employee';
  currentEmployee=signal<EmployeeDto | null>(null);
  private router=inject(Router);
  private myAuthService=inject(MyAuthServiceService)


  Register(model:EmployeeDto){
    return this.http.post(this.baseUrl+'/register',model,{responseType:'blob'});
  }

  Login(model:any){
    return this.http.post<AuthResponse>(this.baseUrl+'/login',model).pipe(
      map(response=>{
        if(response){
          this.myAuthService.setLoggedInUser(response)
          const { token, ...employee } = response;
          localStorage.setItem('employee',JSON.stringify(employee));
          this.currentEmployee.set(employee);
        }
        return response;
      })
    )
  }

  Logout(){
    this.currentEmployee.set(null);
    localStorage.removeItem('employee');
    localStorage.removeItem('auth-token')
    void this.router.navigateByUrl('/employee/login');
  }

  Update(model:any){
    return this.http.put<EmployeeDto>(this.baseUrl+`/update/${model.id}`,model).pipe(
      map(employee=>{
        if(employee){
          localStorage.setItem('employee',JSON.stringify(employee));
          this.currentEmployee.set(employee);
        }
        return employee;
      })
    )
  }

  ChangePassword(model:any){
    return this.http.put<any>(this.baseUrl+'/resetpassword/change',model).subscribe({
      next:()=>{
        alert("Password change successful");
        localStorage.removeItem('employee');
        void this.router.navigateByUrl("/employee/login");
        this.currentEmployee.set(null);
      },
      error:error=>{
        alert(error.error);
      }

      }
    )
  }

  GetAllEmployees(){
    return this.http.get<EmployeeDto[]>(this.baseUrl+'/getAll')
  }

  GetEmployeeById(id:number){
    return this.http.get<EmployeeDto[]>(this.baseUrl+`/${id}`);
  }

  DeleteEmployee(id:number){
    return this.http.delete(this.baseUrl+`/remove/${id}`);
  }

  FilterEmployees(filter:EmployeeFilter,pageNumber?:number,pageSize?:number){
    let request={
      ...filter,
      pageSize:pageSize,
      pageNumber:pageNumber
    }
    let params= buildHttpParams(request)

    if(filter.jobTitle=="Select Job Title") {
      params=params.delete('jobTitle');
    }
    else
      params = params.set('jobTitle', filter.jobTitle!);

    return this.http.get<EmployeeDto[]>(`${this.baseUrl}/filter`, {observe:'response',params});
  }

  UploadProfilePhoto(formData:FormData,employeeId:any){
    return this.http.post<EmployeeDto>(this.baseUrl+`/add-profile-pic/${employeeId}`,formData).pipe(
      map(employee=>{
        if(employee){
          localStorage.removeItem('employee');
          localStorage.setItem('employee',JSON.stringify(employee));
          this.currentEmployee.set(employee)
        }
        return employee;
      })
    );
  }

  RemoveProfilePhoto(employeeId:any){
    return this.http.delete<EmployeeDto>(this.baseUrl+`/remove-profile-pic/${employeeId}`).pipe(
      map(employee=>{
        if(employee){
          localStorage.removeItem('employee');
          localStorage.setItem('employee',JSON.stringify(employee));
          this.currentEmployee.set(employee)
        }
        return employee;
      })
    );
  }

}
