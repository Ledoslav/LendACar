import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {CityService} from '../../services/city.service';
import {City} from '../../Models/City';
import {Country} from '../../Models/Country';
import {CountryService} from '../../services/country.service';
import {NgForm} from '@angular/forms';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {PaginatedResult} from '../../Models/Pagination';
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogConfirmComponent} from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-admin-city-overview',
  templateUrl: './admin-city-overview.component.html',
  styleUrl: './admin-city-overview.component.css'
})
export class AdminCityOverviewComponent implements OnInit {

  ngOnInit(): void {
    this.initSearchListener();
    this.LoadCities();
    this.LoadCountries();
  }
  cityService=inject(CityService);
  countryService=inject(CountryService);
  snackbarService=inject(MySnackbarService)
  private dialog=inject(MatDialog);

  cities:PaginatedResult<City[]>=new PaginatedResult();
  countries:Country[]=[];
  city:any={
    name:"",
    countryId:0
  };
  editMode:boolean=false;
  cityNameSearch:string="";
  selectedFilterCountryId: any;
  private searchSubject: Subject<string> = new Subject();
  pageNumber:number=1;
  pageSize:number=10;

  @ViewChild('cityForm') cityForm?:NgForm;

  CreateCity() {
    if(this.cityForm?.controls['countryId'].value==0){
      this.snackbarService.showErrorMessage("Select valid country")
      return
    }
     this.cityService.AddCity(this.cityForm?.value).subscribe({
       next: _ => {
         this.snackbarService.showSuccessMessage("Successfully added city!");
         this.LoadCities();
       },
       error:err=>console.log(err),
     })
  }

  removeCity($event:any){
    this.cityService.RemoveCity($event.target.value).subscribe({
      next: _ => {
        this.snackbarService.showSuccessMessage("Successfully deleted city!");
        this.LoadCities();
        },
      error:err=>console.log(err),
    })
  }

  LoadCity($event: any) {
    this.city=this.cities.dataItems![$event.target.value];
    this.cityForm?.setValue({
      'name':this.city.name,
      'countryId':this.city.countryId
    })
    this.editMode=true;
  }

  UpdateCity() {
    this.cityService.UpdateCity(this.cityForm?.value,this.city.id).subscribe({
      next:_ => {
        this.snackbarService.showSuccessMessage("Successfully edited city!");
        this.LoadCities();
        this.CancelCountryEdit();
        },
      error:err=>console.log(err)
    })
  }

  CancelCountryEdit(){
    this.editMode=false;
    this.cityForm?.setValue({
      'name':"",
      'countryId':0
    })
  }

  LoadCountries(){
    this.countryService.getAllCountries().subscribe(res=>{
      this.countries=[{id:0, name:'Select Country'},...res];
    })
  }

  LoadCities(){
    this.cityService.getAllCitiesPaged(this.cityNameSearch,this.pageNumber,this.pageSize,this.selectedFilterCountryId).subscribe(res=>{
      this.cities = {
        dataItems: res.body as City[],
        pagination:JSON.parse(res.headers.get('Pagination')!)
      }
    })
  }

  initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((filterValue) => {
      this.LoadCities();
    });
  }

  onCityNameSearch(){
    this.searchSubject.next(this.cityNameSearch);
  }

  onCountryChange($event: any) {
    this.selectedFilterCountryId = $event.target.value;
    this.LoadCities();
  }

  pageChanged($event: any) {
    if(this.pageNumber!==$event.page){
      this.pageNumber=$event.page;
      this.LoadCities();
    }
  }

  openMyConfirmDialog(event:any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete this city',
        confirmButtonText:'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeCity(event)
      }
    });
  }
}
