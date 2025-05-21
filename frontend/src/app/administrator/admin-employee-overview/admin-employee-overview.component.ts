import {Component, inject, OnInit} from '@angular/core';
import {EmployeeDto} from '../../Models/EmployeeDto';
import {EmployeeService} from '../../services/employee.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {Router} from '@angular/router';
import {CountryService} from '../../services/country.service';
import {Country} from '../../Models/Country';
import {UserDto} from '../../Models/UserDto';


@Component({
  selector: 'app-admin-employee-overview',
  templateUrl: './admin-employee-overview.component.html',
  styleUrl: './admin-employee-overview.component.css'
})
export class AdminEmployeeOverviewComponent implements OnInit {

  showCityField: boolean=false;
  router=inject(Router);
  fb=inject(FormBuilder);

  countryService=inject(CountryService);
  countries: Country[]=[];
  cityService=inject(CityService);
  cities:City[]=[];
  filteredCities:City[]=[];

  employees: EmployeeDto[] = [];
  jobTitles:string[]=[" ","Customer support","Developer"];
  employeeService=inject(EmployeeService);

  pageNumber:number=1;
  pageSize:number=5;


  ngOnInit(): void {
    this.loadEmployees();
    this.loadCities();
    this.loadCountries();


    this.employeeSearchForm.get('countryId')?.valueChanges.subscribe((value) => {
      console.log(value);
      if (value == 0) {
        this.showCityField = false;
        this.employeeSearchForm.get('cityId')?.disable();
        console.log(this.showCityField);
      } else {
        this.showCityField = true;
        this.employeeSearchForm.get('cityId')?.enable();
        console.log(this.showCityField);

      }
    });
  }

  loadEmployees(){
    this.employeeService.GetAllEmployees().subscribe({
      next: data =>{ this.employees = data }
    })
  }

  loadCountries(){
    this.countryService.getAllCountries().subscribe({
      next:res=>this.countries = [{id:0, name:'Select Country'},...res],
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
    if(this.employeeSearchForm.value.countryId==0 && this.employeeSearchForm.value.cityId!=undefined)
      this.employeeSearchForm.value.cityId=undefined;
    if(this.employeeSearchForm.value.countryId==0) this.employeeSearchForm.value.countryId=undefined;

      this.employeeService.FilterEmployees(this.employeeSearchForm.value).subscribe({
          next:data=>this.employees = data,
        error:err => console.log(err)
      })
  }

  filterCities($event:any){
    const countryId=$event.target.value;
    this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
  }

  resetForm(){
    this.employeeSearchForm.patchValue({
      name: undefined,
      cityId: undefined,
      countryId: 0,
      ageFrom: undefined,
      ageTo: undefined,
      jobTitle: undefined
    });
  }
}
