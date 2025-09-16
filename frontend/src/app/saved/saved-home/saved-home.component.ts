import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import {CompanyEmployeeService} from '../../services/companyemployee.service';
import {VehicleService} from '../../services/vehicle.service';
import {TranslateService} from '@ngx-translate/core';
import {Bookmark, BookmarkService} from '../../services/bookmark-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-saved-home',
  templateUrl: './saved-home.component.html',
  styleUrl: './saved-home.component.css'
})
export class SavedHomeComponent implements OnInit {
  accountService = inject(UserService);
  authService = inject(MyAuthServiceService);
  companyEmployeeService = inject(CompanyEmployeeService);
  vehicleService = inject(VehicleService);
  translateService = inject(TranslateService);
  bookmarkService = inject(BookmarkService);
  router = inject(Router);

  isEmployee: boolean = false;
  isOwner: boolean = false;
  isAppUser:boolean = false;
  isLoggedIn: boolean = false;
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
  pageInfo:any;
  bookmarks: Bookmark[] = [];
  noSaved:boolean = false;

  ngOnInit() {
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


    this.paging.search = sessionStorage.getItem('search') || '';
    this.getVehicles(this.paging);
    this.loadBookmarks();
  }

  RouteToListing(vehicleId:number) {
    this.router.navigate(['/vehicle/listing/' + vehicleId]);
  }

  getVehicles(paging: pagingRequest) {
    this.vehicleService.getVehicle(paging).subscribe({
      next: (response:any) => {
        this.vehicles = response.dataItems.map((x: any) => ({
          ...x,
          imageIndex: 0
        }));

        this.pageInfo = response;
        this.loadBookmarks();
      }
    });
  }

  toggleBookmark(vehicle: any) {
    this.bookmarkService.toggleBookmark(this.userId, vehicle.id).subscribe({
      next: () => {
        // Toggle locally so UI updates immediately
        vehicle.isBookmarked = !vehicle.isBookmarked;
      },
      error: (err) => {
        console.error('Failed to update bookmark', err);
      }
    });
  }

  loadBookmarks() {
    this.bookmarkService.getBookmarks(this.userId).subscribe({
      next: (res) => {
        this.bookmarks = res;
        if(this.bookmarks.length == 0)
        {
          this.noSaved =true;
        }else {
          this.noSaved =false;
        }
        // Mark vehicles that are already bookmarked
        this.vehicles.forEach((v:any) => {
          v.isBookmarked = this.bookmarks.some(b => b.vehicleId === v.id);
        });
      },
      error: (err) => console.error(err)
    });
  }

  nextPage() {
    if (this.pageInfo.totalPages == this.paging.pageNumber) {
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

  prevImage(vehicle: any, direction: number) {
    if (!vehicle.vehicleImages?.length) return;

    vehicle.imageIndex += direction;

    if (vehicle.imageIndex < 0) {
      vehicle.imageIndex = vehicle.vehicleImages.length - 1; // loop back to last
    } else if (vehicle.imageIndex >= vehicle.vehicleImages.length) {
      vehicle.imageIndex = 0; // loop back to first
    }
  }

  nextImage(vehicle: any, direction: number) {
    this.prevImage(vehicle, direction); // reuse same logic
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
