import {Component, inject, OnInit} from '@angular/core';
import {EmployeeDto} from '../../Models/EmployeeDto';
import {EmployeeService} from '../../services/employee.service';
import {FormBuilder} from '@angular/forms';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {Router} from '@angular/router';
import {CountryService} from '../../services/country.service';
import {Country} from '../../Models/Country';
import {PaginatedResult} from '../../Models/Pagination';
import {DialogConfirmComponent} from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-admin-employee-overview',
  templateUrl: './admin-employee-overview.component.html',
  styleUrl: './admin-employee-overview.component.css'
})
export class AdminEmployeeOverviewComponent implements OnInit {

  showCityField: boolean = false;
  router = inject(Router);
  fb = inject(FormBuilder);

  countryService = inject(CountryService);
  countries: Country[] = [];
  cityService = inject(CityService);
  cities: City[] = [];
  filteredCities: City[] = [];

  employees: PaginatedResult<EmployeeDto[]> = new PaginatedResult()
  jobTitles: string[] = ["Select Job Title", "Customer support", "Developer"];
  employeeService = inject(EmployeeService);
  private dialog = inject(MatDialog);

  pageNumber: number = 1;
  pageSize: number = 5;


  ngOnInit(): void {
    this.loadEmployees();
    this.loadCities();
    this.loadCountries();


    this.employeeSearchForm.get('countryId')?.valueChanges.subscribe((value) => {
      if (value == 0) {
        this.showCityField = false;
        this.employeeSearchForm.get('cityId')?.disable();
      } else {
        this.showCityField = true;
        this.employeeSearchForm.get('cityId')?.enable();

      }
    });
  }

  loadEmployees() {
    let filter = {
      ...this.employeeSearchForm.value,
      countryId: null,
    };
    this.employeeService.FilterEmployees(filter, this.pageNumber, this.pageSize).subscribe({
      next: res => {
        this.employees = {
          dataItems: res.body as EmployeeDto[],
          pagination: JSON.parse(res.headers.get('Pagination')!)
        }
      },
      error: err => console.log(err)
    })
  }

  loadCountries() {
    this.countryService.getAllCountries().subscribe({
      next: res => this.countries = [{id: 0, name: 'Select Country'}, ...res],
    })
  }


  loadCities() {
    this.cityService.GetAllCities().subscribe({
      next: data => {
        this.cities = data;
      }
    })
  }

  employeeSearchForm = this.fb.group({
    name: [undefined],
    cityId: [undefined],
    countryId: 0,
    jobTitle: this.jobTitles[0],
    ageFrom: [undefined],
    ageTo: [undefined]
  })

  DeleteEmployee($event: any) {
    if (this.employeeService.currentEmployee()?.id == $event.target.value) {
      localStorage.removeItem('employee');
      this.employeeService.currentEmployee.set(null);
    }
    this.employeeService.DeleteEmployee($event.target.value).subscribe({
      next: _ => {
        window.location.reload()
      },
      error: err => {
        console.log(err)
      }
    });
  }

  EditEmployee($event: any) {
    const employeeId = $event.target.value;

    const params = {id: employeeId.toString()};

    void this.router.navigate(['/admin/register/'], {queryParams: params});
  }


  onSearch() {
    if (this.employeeSearchForm.value.countryId == 0 && this.employeeSearchForm.value.cityId != undefined)
      this.employeeSearchForm.value.cityId = undefined;
    if (this.employeeSearchForm.value.countryId == 0) this.employeeSearchForm.value.countryId = undefined;

    this.filterEmployees();
  }

  filterCities($event: any) {
    const countryId = $event.target.value;
    this.filteredCities = this.cities.filter(city => city.countryId == countryId)
  }

  resetForm() {
    this.employeeSearchForm.patchValue({
      name: undefined,
      cityId: undefined,
      countryId: 0,
      ageFrom: undefined,
      ageTo: undefined,
      jobTitle: this.jobTitles[0]
    });
  }

  filterEmployees(): void {
    if (this.employeeSearchForm.value.countryId == 0 && this.employeeSearchForm.value.cityId != undefined)
      this.employeeSearchForm.value.cityId = undefined;
    if (this.employeeSearchForm.value.countryId == 0) this.employeeSearchForm.value.countryId = undefined;

    this.employeeService.FilterEmployees(this.employeeSearchForm.value, this.pageNumber, this.pageSize).subscribe({
      next: res => {
        this.employees = {
          dataItems: res.body as EmployeeDto[],
          pagination: JSON.parse(res.headers.get('Pagination')!)
        }
      },
      error: err => console.log(err)
    })
  }


  pageChanged($event: any) {
    if (this.pageNumber !== $event.page) {
      this.pageNumber = $event.page;
      this.filterEmployees();
    }
  }

  openMyConfirmDialog(event:any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm removal',
        message: 'Are you sure you want to remove user',
        confirmButtonText: 'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.DeleteEmployee(event)
      } else {
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }
}
