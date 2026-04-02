import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {UserDto} from '../../Models/UserDto';
import {City} from '../../Models/City';
import {Country} from '../../Models/Country';
import {FormBuilder, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {CountryService} from '../../services/country.service';
import {Router} from '@angular/router';
import {PaginatedResult} from '../../Models/Pagination';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {DialogConfirmComponent} from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';

@Component({
  standalone: false,
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.css'
})
export class UserOverviewComponent  implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private router=inject(Router);
  private dialog=inject(MatDialog);
  private snackBarService=inject(MySnackbarService)
  showCityField: boolean=false;
  ngOnInit(): void {
      this.filterUsers();
      this.loadCities();
      this.loadCountries();

    this.userSearchForm.get('countryId')?.valueChanges.subscribe((value) => {
      if (value == 0) {
        this.showCityField = false;
        this.userSearchForm.get('cityId')?.disable();
      } else {
        this.showCityField = true;
        this.userSearchForm.get('cityId')?.enable();
      }
    
    this.cdr.detectChanges();
  });

    this.userSearchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if(!this.userSearchForm.invalid)
          this.filterUsers();
      
    this.cdr.detectChanges();
  });
  }
  fb=inject(FormBuilder);
  userService=inject(UserService)
  cityService=inject(CityService);
  countryService=inject(CountryService);
  cities: City[]=[];
  countries: Country[]=[];
  filteredCities:City[]=[];
  verifiedFilterOptions:string[]=["Verified users","Yes","No"];

  private searchSubject: Subject<string> = new Subject();

  users:PaginatedResult<UserDto[]>=new PaginatedResult()

  pageNumber:number=1;
  pageSize:number=5;


  loadCities(){
    this.cityService.GetAllCities().subscribe(res=>{
      this.cities = res;
    
    this.cdr.detectChanges();
  })
  }

  loadCountries(){
    this.countryService.getAllCountries().subscribe({
      next:res=>this.countries = [{id:0, name:'Select Country'},...res],
    })
  }


  userSearchForm=this.fb.group({
    name: [undefined,[Validators.minLength(2),Validators.maxLength(50), Validators.pattern(/^[\w\s\-]+$/)]],
    cityId: [undefined],
    countryId: 0,
    ageFrom:[undefined],
    ageTo:[undefined],
    isVerified:["Verified users"],
  })


  Update($event: any) {
    const userId=$event.target.value;

    const params={id:userId.toString()};

    void this.router.navigate(['/admin/user-update/'],{queryParams:params});
  }

  DeleteUser($event: any) {
      if(this.userService.currentUser()?.id==$event.target.value){
        localStorage.removeItem('user');
        this.userService.currentUser.set(null);
      }
      this.userService.Delete($event.target.value).subscribe({
        next:_ => {
          this.snackBarService.showSuccessMessage("Successfully deleted user!");
          setTimeout(() => {
            window.location.reload();
          }, 4000);
          },
        error:err=>{},
      })
  }

  filterCities($event:any){
    const countryId=$event.target.value;
    this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
  }


  filterUsers(): void {
    if(this.userSearchForm.value.countryId==0 && this.userSearchForm.value.cityId!=undefined)
      this.userSearchForm.value.cityId=undefined;
    if(this.userSearchForm.value.countryId==0) this.userSearchForm.value.countryId=undefined;

    this.userService.FilterUsers(this.userSearchForm.value, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          this.users = {
            dataItems: res.body as UserDto[],
            pagination: JSON.parse(res.headers.get('Pagination')!)
          };
        },
        error: (err) => {},
      });
  }

  pageChanged($event: any) {
    if(this.pageNumber!==$event.page){
      this.pageNumber=$event.page;
      this.filterUsers();
    }
  }

  resetForm(){
    this.userSearchForm.patchValue({
      name: undefined,
      cityId: undefined,
      countryId: 0,
      ageFrom: undefined,
      ageTo: undefined,
      isVerified: "Verified users",
    });
  }

  openMyConfirmDialog(event:any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete this user',
        confirmButtonText:'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.DeleteUser(event)
      } else {
      }
    
    this.cdr.detectChanges();
  });
  }
}
