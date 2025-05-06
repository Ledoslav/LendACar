import {Component, inject, OnInit} from '@angular/core';
import {UserDto} from '../../Models/UserDto';
import {City} from '../../Models/City';
import {Country} from '../../Models/Country';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {CountryService} from '../../services/country.service';
import {Router} from '@angular/router';
import {HttpParams, HttpResponse} from '@angular/common/http';
import {PaginatedResult} from '../../Models/Pagination';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {DialogConfirmComponent} from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.css'
})
export class UserOverviewComponent  implements OnInit {
  private router=inject(Router);
  private dialog=inject(MatDialog);
  private snackBarService=inject(MySnackbarService)
  showCityField: boolean=false;
  ngOnInit(): void {
      this.initSearchListener();
      this.loadUsers();
      this.loadCities();
      this.loadCountries();

    this.userSearchForm.get('countryId')?.valueChanges.subscribe((value) => {
      console.log(value);
      if (value == 0) {
        this.showCityField = false;
        this.userSearchForm.get('cityId')?.disable();
        console.log(this.showCityField);
      } else {
        this.showCityField = true;
        this.userSearchForm.get('cityId')?.enable();
        console.log(this.showCityField);

      }
    });
  }
  fb=inject(FormBuilder);
  userService=inject(UserService)
  cityService=inject(CityService);
  countryService=inject(CountryService);
  newUsers: UserDto[]=[];
  cities: City[]=[];
  countries: Country[]=[];
  filteredCities:City[]=[];
  verifiedFilterOptions:string[]=["Verified users","Yes","No"];

  private searchSubject: Subject<string> = new Subject();

  users:PaginatedResult<UserDto[]>=new PaginatedResult()

  pageNumber:number=1;
  pageSize:number=5;


  initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((filterValue) => {
      this.filterUsers();
    });
  }

  loadUsers(){
    this.userService.GetAllUsers(this.pageNumber,this.pageSize).subscribe({
     next:res=> {
       this.users={
         items:res.body as UserDto[],
         pagination:JSON.parse(res.headers.get('Pagination')!)
       };
       console.log(this.users.pagination);
     },
      error:err=>console.log(err),
    })
  }

  loadCities(){
    this.cityService.GetAllCities().subscribe(res=>{
      this.cities = res;
    })
  }

  loadCountries(){
    this.countryService.getAllCountries().subscribe({
      next:res=>this.countries = [{id:0, name:'Select Country'},...res],
    })
  }


  userSearchForm=this.fb.group({
    name: [undefined],
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
    console.log($event.target.value);
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
        error:err=>console.log(err),
      })
  }

  filterCities($event:any){
    const countryId=$event.target.value;
    this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
  }


  onSearch() {
     console.log(this.userSearchForm.value);
    if(this.userSearchForm.value.countryId==0 && this.userSearchForm.value.cityId!=undefined)
      this.userSearchForm.value.cityId=undefined;
     if(this.userSearchForm.value.countryId==0) this.userSearchForm.value.countryId=undefined;
     this.filterUsers();
  }

  onNameUsernameSearch(){
    const searchValue = this.userSearchForm.get('name')?.value || '';
    if(this.userSearchForm.value.countryId==0) this.userSearchForm.value.countryId=undefined;
    if(this.userSearchForm.value.countryId==0 && this.userSearchForm.value.cityId!=undefined)
      this.userSearchForm.value.cityId=undefined;

    if (searchValue.trim().length > 0) {
      this.searchSubject.next(searchValue);
    }
  }

  filterUsers(): void {
    this.userService.FilterUsers(this.userSearchForm.value, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          this.users = {
            items: res.body as UserDto[],
            pagination: JSON.parse(res.headers.get('Pagination')!)
          };
        },
        error: (err) => console.log(err),
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
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }
}
