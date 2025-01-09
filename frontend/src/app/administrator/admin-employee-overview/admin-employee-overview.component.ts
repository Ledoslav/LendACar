import {Component, inject, OnInit} from '@angular/core';
import {EmployeeDto} from '../../Models/EmployeeDto';
import {EmployeeService} from '../../services/employee.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {Router} from '@angular/router';


@Component({
  selector: 'app-admin-employee-overview',
  templateUrl: './admin-employee-overview.component.html',
  styleUrl: './admin-employee-overview.component.css'
})
export class AdminEmployeeOverviewComponent implements OnInit {
  ngOnInit(): void {
    this.loadEmployees();
    this.loadCities();

  }

  router=inject(Router);
  fb=inject(FormBuilder);

  cityService=inject(CityService);
  cities:City[]=[];
  filteredCities:City[]=[];



  employees: EmployeeDto[] = [];
  jobTitles:string[]=[" ","Customer support","Developer"];
  employeeService=inject(EmployeeService);



  loadEmployees(){
    this.employeeService.GetAllEmployees().subscribe({
      next: data =>{ this.employees = data }
    })
  }

  loadCities(){
    this.cityService.GetAllCities().subscribe({
      next: data => {
        this.cities = data;
        console.log(this.cities)
      }
    })
  }

  employeeSearchForm=this.fb.group({
    name: [undefined],
    cityId: [undefined],
    countryId: 0,
    jobTitle:[undefined],
    ageFrom:[undefined],
    ageTo:[undefined]
  })

  DeleteEmployee($event: any) {
    console.log(this.employeeService.currentEmployee());

    if(window.confirm("Are you sure you want to delete employee")){
      if(this.employeeService.currentEmployee()?.id==$event.target.value){
        localStorage.removeItem('employee');
        this.employeeService.currentEmployee.set(null);
      }
      this.employeeService.DeleteEmployee($event.target.value).subscribe({
        next: _ => {window.location.reload()},
        error: err => {console.log(err)}
      });
    }
    else return;

  }

  EditEmployee($event: any) {
    const employeeId=$event.target.value;

    const params={id:employeeId.toString()};

    void this.router.navigate(['/admin/register/'],{queryParams:params});
  }



  onSearch() {
      console.log(this.employeeSearchForm.value);
      this.employeeService.FilterEmployees(this.employeeSearchForm.value).subscribe({
          next:data=>this.employees = data,
        error:err => console.log(err)
      })
  }

}
