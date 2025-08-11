import {Component, inject} from '@angular/core';
import {UserService} from '../../services/user.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';

@Component({
  selector: 'app-pretraga-home',
  templateUrl: './pretraga-home.component.html',
  styleUrl: './pretraga-home.component.css'
})
export class PretragaHomeComponent {
  accountService=inject(UserService);
  authService=inject(MyAuthServiceService);

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

  ngOnInit(): void {
    this.isLoggedIn=this.authService.isLoggedIn();
    this.isAppUser=this.authService.isAppUser();
  }

  isLoggedIn: boolean=false;
  isAppUser:boolean=false;

  openDialogFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  toggleAllActive(divActive: string) {
    if(divActive == "allDate"){
      this.allDateActive = !this.allDateActive;
      this.last24Active = false;
      this.last7Active = false;
      this.lastMonthActive = false;
    }else if(divActive == "allTrans"){
      this.allTransActive = !this.allTransActive;
      this.manualTransActive = false;
      this.automaticTransActive = false;
    }else if(divActive == "allFuel"){
      this.allFuelActive = !this.allFuelActive;
      this.petrolActive = false;
      this.dieselActive = false;
      this.otherFuelActive = false;
    }
  }

  toggleActive(divActive: string) {
    if(divActive == "last24"){
      this.last24Active = !this.last24Active;
      this.allDateActive = false;
    }else if(divActive == "last7"){
      this.last7Active = !this.last7Active;
      this.allDateActive = false;
    }else if(divActive == "lastMonth"){
      this.lastMonthActive = !this.lastMonthActive;
      this.allDateActive = false;
    } else if(divActive == "manualTrans"){
      this.manualTransActive = !this.manualTransActive;
      this.allTransActive = false;
    } else if(divActive == "automaticTrans"){
      this.automaticTransActive = !this.automaticTransActive;
      this.allTransActive = false;
    }else if(divActive == "petrol"){
      this.petrolActive = !this.petrolActive;
      this.allFuelActive = false;
    }else if(divActive == "diesel"){
      this.dieselActive = !this.dieselActive;
      this.allFuelActive = false;
    }else if(divActive == "otherFuel"){
      this.otherFuelActive = !this.otherFuelActive;
      this.allFuelActive = false;
    }else if(divActive == "specialOffers"){
      this.specialOffersActive = !this.specialOffersActive;
    }else if(divActive == "specialEquipment"){
      this.specialEquipmentActive = !this.specialEquipmentActive;
    }
  }
}
