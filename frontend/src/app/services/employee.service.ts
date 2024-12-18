import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {EmployeeDto} from '../Models/EmployeeDto';
import {map} from 'rxjs';
import {Router} from '@angular/router';
import {EmployeeFilter} from '../Models/EmployeeFilter';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor() { }

  private http=inject(HttpClient);
  baseUrl:string="http://localhost:7000/api/";
  currentEmployee=signal<EmployeeDto | null>(null);
  private router=inject(Router);

  Register(model:EmployeeDto){
    return this.http.post(this.baseUrl+'employee/register',model);
  }

  Login(model:any){
    return this.http.post<EmployeeDto>(this.baseUrl+'employee/login',model).pipe(
      map(employee=>{
        if(employee){
          localStorage.setItem('employee',JSON.stringify(employee));
          this.currentEmployee.set(employee);
        }
        return employee;
      })
    )
  }

  Update(model:any){
    return this.http.put<EmployeeDto>(this.baseUrl+`employee/update/${model.id}`,model).pipe(
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
    return this.http.put<any>(this.baseUrl+'resetpassword/change',model).subscribe({
      next:()=>{
        alert("Password change successful");
        localStorage.removeItem('employee');
        void this.router.navigateByUrl("/employee/login");
        this.currentEmployee.set(null);
      },
      error:error=>{
        alert(error.error);
        console.log(error)
      }
      }
    )
  }

  GetAllEmployees(){
    return this.http.get<EmployeeDto[]>(this.baseUrl+'employee/getAll')
  }

  FilterEmployees(filter:EmployeeFilter){
    let params = new HttpParams();

    // Dynamically append query parameters if they have values
    if (filter.name) params = params.set('name', filter.name);
    if (filter.ageFrom !== null && filter.ageFrom !== undefined) params = params.set('ageFrom', filter.ageFrom.toString());
    if (filter.ageTo !== null && filter.ageTo !== undefined) params = params.set('ageTo', filter.ageTo.toString());
    if (filter.cityId !== null && filter.cityId !== undefined) params = params.set('cityId', filter.cityId.toString());
    if (filter.jobTitle) params = params.set('jobTitle', filter.jobTitle);

    return this.http.get<EmployeeDto[]>(`${this.baseUrl}employee/filter`, { params });
  }

}
