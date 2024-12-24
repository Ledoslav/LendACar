import {Component, inject, OnInit} from '@angular/core';
import {UserDto} from '../../Models/UserDto';
import {City} from '../../Models/City';
import {Country} from '../../Models/Country';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {CountryService} from '../../services/country.service';
import {Router} from '@angular/router';
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.css'
})
export class UserOverviewComponent  implements OnInit {
  private router=inject(Router);
  ngOnInit(): void {
      this.loadUsers();
      this.loadCities();
      this.loadCountries();
  }
  fb=inject(FormBuilder);
  userService=inject(UserService)
  cityService=inject(CityService);
  countryService=inject(CountryService);
  users: UserDto[]=[];
  cities: City[]=[];
  countries: Country[]=[];
  filteredCities:City[]=[];
  verifiedFilterOptions:string[]=[" ","Yes","No"];

  loadUsers(){
    this.userService.GetAllUsers().subscribe({
     next:res=>this.users=res,
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
    isVerified:[undefined],
  })


  Update($event: any) {
    const userId=$event.target.value;

    const params={id:userId.toString()};

    void this.router.navigate(['/admin/user-update/'],{queryParams:params});
  }

  DeleteUser($event: any) {
    console.log($event.target.value);
    if(window.confirm("Are you sure you want to delete this user?")){
      if(this.userService.currentUser()?.id==$event.target.value){
        localStorage.removeItem('user');
        this.userService.currentUser.set(null);
      }
      this.userService.Delete($event.target.value).subscribe({
        next:_ => {window.location.reload();},
        error:err=>console.log(err),
      })
    }
    else return;
  }

  filterCities($event:any){
    const countryId=$event.target.value;
    this.filteredCities=this.cities.filter(city=>city.countryId==countryId)
  }


  onSearch() {
     console.log(this.userSearchForm.value);
     if(this.userSearchForm.value.countryId==0) this.userSearchForm.value.countryId=undefined;
     this.userService.FilterUsers(this.userSearchForm.value).subscribe({
       next:res=>this.users=res,
       error:err=>console.log(err),
     })

  }
}
