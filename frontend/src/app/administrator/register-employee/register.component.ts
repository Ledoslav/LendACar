import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {CityService} from '../../services/city.service';
import {EmployeeService} from '../../services/employee.service';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {AdminService} from '../../services/administrator.service';
import {City} from '../../Models/City';
import {Country} from '../../Models/Country';
import {CountryService} from '../../services/country.service';
import {concatMap, Observable} from 'rxjs';
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';

@Component({
  standalone: false,
  selector: 'app-register-employee',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {


  constructor() {
    this.employeeForm=this.fb.group({
      id:[{value:0,disabled:true}],
      firstName: [undefined, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: [undefined, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      emailAddress: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      username: [undefined, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      phoneNumber: [undefined, [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$"), Validators.maxLength(20)]],
      cityId: [undefined, Validators.required],
      countryId:[undefined, Validators.required],
      birthDate: [undefined, [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      jobTitle:[undefined, Validators.required],
      dateOfHire:[undefined, Validators.required],
      workingHourId:1
    })
  }

  employee: any;
  cities: City[]=[];
  countries: Country[]=[];
  filteredCities: City[]=[];
  cityService=inject(CityService);
  employeeService=inject(EmployeeService);
  private route=inject(ActivatedRoute);
  private datePipe=inject(DatePipe);
  adminService=inject(AdminService);
  fb=inject(FormBuilder);
  private countryService=inject(CountryService);
  private snackBarService=inject(MySnackbarService);
  employeeForm!:FormGroup;

  editMode=false;
  minDate=new Date(2023,12,1);
  maxDate=new Date();

  ngOnInit(): void {
    this.loadCountries();
    const employeeId=this.route.snapshot.queryParamMap.get('id');
    if(employeeId) {
      this.editMode=true;
      this.getCitiesAndEmployee(employeeId).subscribe({
        next: result => {
          this.employee= result;
          this.formatDate();
          this.initForm();
        }
      });
    }
    else{
        this.editMode=false;
        this.loadCountries();
        this.loadCities();
    }

    this.employeeForm.get('countryId')?.valueChanges.subscribe(val=>{
      this.FilterCities(val);
    })

    this.employeeForm.get('firstName')?.valueChanges.subscribe(val=>{
      this.generateEmail();
    })

    this.employeeForm.get('lastName')?.valueChanges.subscribe(val=>{
      this.generateEmail();
    })

  }

  initForm(){
    this.employeeForm.get('id')?.enable()
    this.employeeForm.patchValue({
      id:this.employee.id,
      firstName: this.employee.firstName,
      lastName: this.employee.lastName,
      emailAddress: this.employee.emailAddress,
      username: this.employee.username,
      phoneNumber: this.employee.phoneNumber,
      cityId: this.employee.cityId,
      countryId: this.employee.city.countryId,
      birthDate: this.employee.birthDate,
      jobTitle: this.employee.jobTitle,
      dateOfHire: this.employee.dateOfHire,
    });
    this.FilterCities(this.employee.city.countryId);
  }



  loadEmployee(employeeId:string){
    const id=Number(employeeId);
    return this.employeeService.GetEmployeeById(id)
  }

  loadCountries(){
    this.countryService.getAllCountries().subscribe(res=>{
      this.countries = res;
    })
  }

  getCitiesAndEmployee(employeeId:string):Observable<any>{
    return this.cityService.GetAllCities().pipe(
      concatMap(cities=>{
        this.cities=cities;
        return this.loadEmployee(employeeId);
      })
    )
  }

  formatDate(){
    if (this.employee.birthDate) {
      const [year, month, day] = this.employee.birthDate.split('-').map(Number);
      this.employee.birthDate = new Date(year, month - 1, day); // month is 0-indexed
    }
    if (this.employee.dateOfHire) {
      const [year, month, day] = this.employee.dateOfHire.split('-').map(Number);
      this.employee.dateOfHire = new Date(year, month - 1, day); // month is 0-indexed
    }
  }

  loadCities(){
    this.cityService.GetAllCities().subscribe(res=>{
      this.cities = res;
    })
  }

  formatEmail(email:string):string{
    return email
      .replace(/š/g, 's')
      .replace(/đ/g, 'd')
      .replace(/ć/g, 'c')
      .replace(/č/g, 'c')
      .replace(/ž/g, 'z')
      .replace(/dž/g, 'dz');
  }

  generateEmail(): void {
    if (this.employeeForm.get('firstName')?.value || this.employeeForm.get('lastName')?.value) {
      const FirstName = this.employeeForm.get('firstName')?.value.trim().toLowerCase();
      const LastName = this.employeeForm.get('lastName')?.value.trim().toLowerCase();

      // Generate the email
      let email=`${FirstName}.${LastName}@lendacar.ba`;
      this.employeeForm.patchValue({
        emailAddress:this.formatEmail(email)
      })
    }
    else {
      this.employeeForm.patchValue({
        emailAddress:''
      })
    }
  }


  register(form: any) {
    const formData = { ...this.employeeForm.value };

    if (formData.birthDate) {

      const year = formData.birthDate.getFullYear();
      const month = String(formData.birthDate.getMonth() + 1).padStart(2, '0');
      const day = String(formData.birthDate.getDate()).padStart(2, '0');
      formData.birthDate = `${year}-${month}-${day}`;
    }
    if (formData.dateOfHire) {

      const year = formData.dateOfHire.getFullYear();
      const month = String(formData.dateOfHire.getMonth() + 1).padStart(2, '0');
      const day = String(formData.dateOfHire.getDate()).padStart(2, '0');
      formData.dateOfHire = `${year}-${month}-${day}`;
    }

    this.employeeService.Register(formData).subscribe({
      next:result => {
        this.snackBarService.showSuccessMessage("Employee created successfully")
        const pdfUrl=URL.createObjectURL(result);
        window.open(pdfUrl);
      }
    })
  }

  update(){
    let formData = { ...this.employeeForm.value };


    if (formData.birthDate) {
      if (formData.birthDate instanceof Date) {
        // Format date as yyyy-MM-dd without timezone conversion
        const year = formData.birthDate.getFullYear();
        const month = String(formData.birthDate.getMonth() + 1).padStart(2, '0');
        const day = String(formData.birthDate.getDate()).padStart(2, '0');
        formData.birthDate = `${year}-${month}-${day}`;
      } else if (typeof formData.birthDate === 'string') {

        formData.birthDate = formData.birthDate;
      }
    }
    if (formData.dateOfHire) {
      if (formData.dateOfHire instanceof Date) {
        // Format date as yyyy-MM-dd without timezone conversion
        const year = formData.dateOfHire.getFullYear();
        const month = String(formData.dateOfHire.getMonth() + 1).padStart(2, '0');
        const day = String(formData.dateOfHire.getDate()).padStart(2, '0');
        formData.dateOfHire = `${year}-${month}-${day}`;
      } else if (typeof formData.dateOfHire === 'string') {

        formData.dateOfHire = formData.dateOfHire;
      }
    }

    this.adminService.UpdateEmployee(formData).subscribe({
      next:result=> {
        this.employee = result;
        this.formatDate();
        this.snackBarService.showSuccessMessage("Successfully updated employee")
      },
      error:err=>{console.log(err) }
    })
  }


  FilterCities(countryId:number) {

      this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
  }
}
