import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import {CompanyEmployeeService} from '../../services/companyemployee.service';
import {VehicleService} from '../../services/vehicle.service';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-pretraga-home',
  templateUrl: './pretraga-home.component.html',
  styleUrl: './pretraga-home.component.css'
})
export class PretragaHomeComponent implements OnInit {
  accountService = inject(UserService);
  authService = inject(MyAuthServiceService);
  companyEmployeeService = inject(CompanyEmployeeService);
  vehicleService = inject(VehicleService);

  isFilterOpen: boolean = false;
  last24Active: boolean = false;
  last7Active: boolean = false;
  lastMonthActive: boolean = false;
  manualTransActive: boolean = false;
  automaticTransActive: boolean = false;
  petrolActive: boolean = false;
  dieselActive: boolean = false;
  otherFuelActive: boolean = false;
  specialOffersActive: boolean = false;
  specialEquipmentActive: boolean = false;
  allDateActive: boolean = false;
  allTransActive: boolean = false;
  allFuelActive: boolean = false;
  isEmployee: boolean = false;
  isOwner: boolean = false;
  vehicles: any = [];
  switchClicked: boolean = false;
  mode: string = 'light-mode';
  userId: any;
  companyAdminEmail: any;
  employee: any;
  paging: pagingRequest = {
    pageNumber: 1,
    pageSize: 4,
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
  priceFrom: number = 1;
  priceTo: number = 15000;

  _formBuilder = inject(FormBuilder);

  searchGroup = this._formBuilder.group({
    search: ['', [Validators.required]]
  });


  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAppUser = this.authService.isAppUser();

    this.userId = this.accountService.currentUser()?.id;

    if (localStorage.getItem('mode') == 'dark-mode') {
      this.mode = 'dark-mode';
      this.switchClicked = true;
    } else {
      this.mode = 'light-mode';
      this.switchClicked = false;
    }

    if (this.isAppUser == false || this.isLoggedIn == false) {
      this.isOwner = false;
      this.isEmployee = false;
      return;
    }

    this.companyEmployeeService.getCompanyAdminEmail(this.userId).subscribe({
      next: (response2) => {
        if (response2 != null) {
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
      next: (response) => {
        if (response == null) {
          return;
        }

        this.employee = response;

        if (this.employee.companyAdminEmail != null && this.employee.company.companyName == null) {
          this.isOwner = true;
          this.isEmployee = false;
        } else if (this.employee.companyAdminEmail == null && this.employee.company.companyName != null) {
          this.isEmployee = true;
          this.isOwner = false;
        } else if (this.employee.companyAdminEmail != null && this.employee.company.companyName != null) {
          this.isOwner = true;
          this.isEmployee = false;
        } else {
          this.isOwner = false;
          this.isEmployee = false;
        }
      }
    })

    this.searchGroup.patchValue({
      search: sessionStorage.getItem('search')
    })

    this.paging.search = sessionStorage.getItem('search') || '';
    this.getVehicles(this.paging);
  }

  isLoggedIn: boolean = false;
  isAppUser: boolean = false;

  openDialogFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  toggleAllActive(divActive: string) {
    if (divActive == "allDate") {
      this.allDateActive = !this.allDateActive;
      this.last24Active = false;
      this.last7Active = false;
      this.lastMonthActive = false;
      this.paging.allDateActive = this.allDateActive;
      this.paging.last24Active = this.last24Active;
      this.paging.last7Active = this.last7Active;
      this.paging.lastMonthActive = this.lastMonthActive;
    } else if (divActive == "allTrans") {
      this.allTransActive = !this.allTransActive;
      this.manualTransActive = false;
      this.automaticTransActive = false;
      this.paging.allTransActive = this.allTransActive;
      this.paging.manualTransActive = this.manualTransActive;
      this.paging.automaticTransActive = this.automaticTransActive;
    } else if (divActive == "allFuel") {
      this.allFuelActive = !this.allFuelActive;
      this.petrolActive = false;
      this.dieselActive = false;
      this.otherFuelActive = false;
      this.paging.allFuelActive = this.allFuelActive;
      this.paging.petrolActive = this.petrolActive;
      this.paging.dieselActive = this.dieselActive;
      this.paging.otherFuelActive = this.otherFuelActive;
    }
  }

  toggleActive(divActive: string) {
    if (divActive == "last24") {
      this.last24Active = !this.last24Active;
      this.allDateActive = false;
      this.paging.last24Active = this.last24Active;
      this.paging.allDateActive = this.allDateActive;
    } else if (divActive == "last7") {
      this.last7Active = !this.last7Active;
      this.allDateActive = false;
      this.paging.last7Active = this.last7Active;
      this.paging.allDateActive = this.allDateActive;
    } else if (divActive == "lastMonth") {
      this.lastMonthActive = !this.lastMonthActive;
      this.allDateActive = false;
      this.paging.lastMonthActive = this.lastMonthActive;
      this.paging.allDateActive = this.allDateActive;
    } else if (divActive == "manualTrans") {
      this.manualTransActive = !this.manualTransActive;
      this.allTransActive = false;
      this.paging.manualTransActive = this.manualTransActive;
      this.paging.allTransActive = this.allTransActive;
    } else if (divActive == "automaticTrans") {
      this.automaticTransActive = !this.automaticTransActive;
      this.allTransActive = false;
      this.paging.automaticTransActive = this.automaticTransActive;
      this.paging.allTransActive = this.allTransActive;
    } else if (divActive == "petrol") {
      this.petrolActive = !this.petrolActive;
      this.allFuelActive = false;
      this.paging.petrolActive = this.petrolActive;
      this.paging.allFuelActive = this.allFuelActive;
    } else if (divActive == "diesel") {
      this.dieselActive = !this.dieselActive;
      this.allFuelActive = false;
      this.paging.dieselActive = this.dieselActive;
      this.paging.allFuelActive = this.allFuelActive;
    } else if (divActive == "otherFuel") {
      this.otherFuelActive = !this.otherFuelActive;
      this.allFuelActive = false;
      this.paging.otherFuelActive = this.otherFuelActive;
      this.paging.allFuelActive = this.allFuelActive;
    } else if (divActive == "specialOffers") {
      this.specialOffersActive = !this.specialOffersActive;
      this.paging.specialOffersActive = this.specialOffersActive;
    } else if (divActive == "specialEquipment") {
      this.specialEquipmentActive = !this.specialEquipmentActive;
      this.paging.specialEquipmentActive = this.specialEquipmentActive;
    }
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

  getVehicles(paging: pagingRequest) {
    this.vehicleService.getVehicle(paging).subscribe({
      next: (response) => {
        this.vehicles = response;
      }
    })
  }

  nextPage() {
    if (this.vehicles.length < this.paging.pageSize) {
      return;
    }

    this.paging.pageNumber++;
    this.getVehicles(this.paging);
    window.scrollTo(0, 0);
  }

  prevPage() {
    if (this.paging.pageNumber === 1) {
      return;
    }

    this.paging.pageNumber--;
    this.getVehicles(this.paging);
    window.scrollTo(0, 0);
  }

  protected readonly Math = Math;

  setPriceFrom($event: any) {
    this.paging.fromPrice = $event;
    this.priceFrom = $event;
  }

  setPriceTo($event: number) {
    this.paging.toPrice = $event;
    this.priceTo = $event;
  }

  search(){
    this.paging.search = String(this.searchGroup.value.search);
    this.getVehicles(this.paging);
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

