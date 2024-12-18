import {Component, inject, OnInit} from '@angular/core';
import {EmployeeDto} from '../../Models/EmployeeDto';
import {EmployeeService} from '../../services/employee.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';

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

  fb=inject(FormBuilder);
  cityService=inject(CityService);
  cities:City[]=[];
  employees: EmployeeDto[] = [];
  jobTitles:string[]=[" ","Customer support","Developer"];
  employeeService=inject(EmployeeService);
  employeeSearchForm=this.fb.group({
    name: [undefined],
    cityId: [undefined],
    jobTitle:[undefined],
    ageFrom:[undefined],
    ageTo:[undefined]
  })

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

  DeleteEmployee($event: any) {
    console.log($event.target.value);
  }

  EditEmployee($event: any) {
    console.log($event.target.value);
  }

  onSearch() {
      console.log(this.employeeSearchForm.value);
      this.employeeService.FilterEmployees(this.employeeSearchForm.value).subscribe({
          next:data=>this.employees = data,
        error:err => console.log(err)
      })
  }

}
