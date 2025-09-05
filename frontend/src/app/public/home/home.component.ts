import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import {CompanyEmployeeService} from '../../services/companyemployee.service';
import {VehicleService} from '../../services/vehicle.service';
import {FormBuilder, Validators} from '@angular/forms';
import {CountryService} from '../../services/country.service';
import {CityService} from '../../services/city.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  accountService=inject(UserService);
  authService=inject(MyAuthServiceService);
  companyEmployeeService=inject(CompanyEmployeeService);
  vehicleService=inject(VehicleService);
  countryService=inject(CountryService);
  cityService=inject(CityService);
  translateService=inject(TranslateService);

  constructor(
    private router: Router
  ) {}


  private _formBuilder = inject(FormBuilder);

  isLoggedIn: boolean=false;
  isAppUser:boolean=false;

  userId: any = 0 || null;
  employee: any = null;
  isEmployee: boolean = false;
  isOwner: boolean = false;
  companyAdminEmail: any = null;
  vehicles:any = [];
  paging: pagingRequest = {
    pageNumber: 1,
    pageSize: 3,
    search: '',
    fromPrice: 1,
    toPrice: 15000,
    last24Active: false,
    last7Active: false,
    lastMonthActive: false,
    manualTransActive: false,
    automaticTransActive: false,
    petrolActive: false,
    dieselActive: false,
    otherFuelActive: false,
    specialOffersActive: false,
    specialEquipmentActive: false,
    allDateActive: false,
    allTransActive: false,
    allFuelActive: false
  }
  countries: any = [];
  cities: any = [];
  switchClicked: boolean = false;
  mode: string = 'light-mode';

  ngOnInit(): void {
    this.isLoggedIn=this.authService.isLoggedIn();
    this.isAppUser=this.authService.isAppUser();
    this.userId = this.accountService.currentUser()?.id;

    if(localStorage.getItem('mode') == 'dark-mode'){
      this.mode = 'dark-mode';
      this.switchClicked = true;
    }else{
      this.mode = 'light-mode';
      this.switchClicked = false;
    }

    if(this.isAppUser == false || this.isLoggedIn == false) {
      this.isOwner = false;
      this.isEmployee = false;

      console.log(this.isOwner, this.isEmployee);

      return;
    }


    this.companyEmployeeService.getCompanyAdminEmail(this.userId).subscribe({
      next: (response2) => {
        if(response2 != null){
          this.companyAdminEmail = response2;
          this.isOwner = true;
          this.isEmployee = false;
          return;
        }

        console.log("No company admin email found");
        this.isOwner = false;
        this.isEmployee = false;
        return;
      }
    });

    this.companyEmployeeService.getEmployeeForAdmin(this.userId).subscribe({
      next: (response) =>{

        if(response == null){
          return;
        }

         this.employee=response;

         if(this.employee.companyAdminEmail != null && this.employee.company.companyName == null){
           this.isOwner = true;
           this.isEmployee = false;
         }
         else if(this.employee.companyAdminEmail == null && this.employee.company.companyName != null)
         {
          this.isEmployee = true;
          this.isOwner = false;
         }
         else if(this.employee.companyAdminEmail != null && this.employee.company.companyName != null){
           this.isOwner = true;
           this.isEmployee = false;
         }
         else{
           this.isOwner = false;
           this.isEmployee = false;
         }
      }
    })

    this.paging.search = sessionStorage.getItem('search') || '';
    this.getVehicles(this.paging);
    this.loadCountries();
  }

  formGroup = this._formBuilder.group({
    country: ['', [Validators.required]],
    pickUpLocation: ['', [Validators.required]],
    returnLocation: ['', [Validators.required]],
    pickUpDate: ['', [Validators.required]],
    returnDate: ['', [Validators.required]],
  });

  searchGroup = this._formBuilder.group({
    search: ['', [Validators.required]]
  });

  openSearch() {

    let country = this.formGroup.value.country;
    let pickUpLocation = this.formGroup.value.pickUpLocation;
    let returnLocation = this.formGroup.value.returnLocation;

    sessionStorage.setItem('search', String(this.searchGroup.value.search));
    sessionStorage.setItem('country', String(JSON.stringify(country)));
    sessionStorage.setItem('pickUpLocation', String(JSON.stringify(pickUpLocation)));
    sessionStorage.setItem('returnLocation', String(JSON.stringify(returnLocation)));
    sessionStorage.setItem('pickUpDate', String(this.formGroup.value.pickUpDate));
    sessionStorage.setItem('returnDate', String(this.formGroup.value.returnDate));

    this.router.navigate(['/pretraga']);
  }

  prev(){
    if(this.paging.pageNumber == 1){
      return;
    }

    this.paging.pageNumber--;

    this.getVehicles(this.paging);
  }

  next(){
    if(this.vehicles.length < this.paging.pageSize){
      return;
    }

    this.paging.pageNumber++;

    this.getVehicles(this.paging);
  }

  getVehicles(paging: pagingRequest){
    this.vehicleService.getVehicle(paging).subscribe({
      next: (response) =>{
        this.vehicles = response;
      }
    })
  }

  onCountryChange(country:any){
    const countryId = country.id;
    this.loadCities(countryId);
  }

  loadCountries(){
      this.countryService.getAllCountries().subscribe({
        next: (response) => {
          this.countries = response;
        }
      });
}

loadCities(countryId: number){
    console.log(countryId);

    this.cityService.GetAllCitiesByCountryId(countryId).subscribe({
      next: (response) => {
        this.cities = response;
      }
    });
}

  toggleDarkMode() {
    this.switchClicked = !this.switchClicked;

    if (this.switchClicked) {
      this.mode = 'dark-mode';
      localStorage.setItem('mode', this.mode);
    } else {
      this.mode = 'light-mode';
      localStorage.setItem('mode', this.mode);
    }
  }

  search(){
    this.paging.search = String(this.searchGroup.value.search);
    this.getVehicles(this.paging);
  }

  RouteToListing(vehicleId:number) {
    this.router.navigate(['/vehicle/listing/' + vehicleId]);
  }

}

interface pagingRequest{
  pageNumber: number;
  pageSize: number;
  search: string;
  fromPrice: number;
  toPrice: number;
  last24Active: boolean;
  last7Active: boolean;
  lastMonthActive: boolean;
  manualTransActive: boolean;
  automaticTransActive: boolean;
  petrolActive: boolean;
  dieselActive: boolean;
  otherFuelActive: boolean;
  specialOffersActive: boolean;
  specialEquipmentActive: boolean;
  allDateActive: boolean;
  allTransActive: boolean;
  allFuelActive: boolean;
}
