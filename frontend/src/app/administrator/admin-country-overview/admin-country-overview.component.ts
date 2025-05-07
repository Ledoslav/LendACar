import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {Country} from '../../Models/Country';
import {CountryService} from '../../services/country.service';
import {NgForm} from '@angular/forms';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {DialogConfirmComponent} from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import {MatDialog} from '@angular/material/dialog';
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';
import {PaginatedResult} from '../../Models/Pagination';

@Component({
  selector: 'app-admin-country-overview',
  templateUrl: './admin-country-overview.component.html',
  styleUrl: './admin-country-overview.component.css'
})
export class AdminCountryOverviewComponent implements OnInit {

  ngOnInit(): void {
    this.initSearchListener();
     this.LoadCountries();
  }

  countryService=inject(CountryService);
  countries: PaginatedResult<Country[]>=new PaginatedResult();
  country:any;
  editMode:boolean=false;
  countryNameSearch:string="";
  pageNumber:number=1;
  pageSize:number=10;
  @ViewChild('countryForm') countryForm?:NgForm;
  private searchSubject: Subject<string> = new Subject();
  private dialog=inject(MatDialog);
  private snackBarService=inject(MySnackbarService)


  CreateCountry() {
    this.countryService.CreateCountry(this.countryForm?.value).subscribe({
      next:_=> {
        this.snackBarService.showSuccessMessage("Successfully added country!");
        this.LoadCountries();
      },
      error:err=>console.log(err),
    })
  }
  removeCountry($event:any){
    this.countryService.RemoveCountry($event.target.value).subscribe({
      next:_=> {
        this.snackBarService.showSuccessMessage("Successfully deleted country!");
        this.LoadCountries();
      },
      error:err=>console.log(err),
    })
  }

  LoadCountry($event: any) {
    this.country=this.countries.dataItems![$event.target.value];
    this.editMode=true;

  }
  EditCountry() {
    this.countryService.UpdateCountry(this.countryForm?.value,this.country.id).subscribe({
      next:_=>{
        this.snackBarService.showSuccessMessage("Successfully edited country!");
        this.LoadCountries();
        this.editMode=false; },
      error:err=>console.log(err)
    })
  }

  LoadCountries(){
    this.countryService.getAllCountriesPaged(this.countryNameSearch,this.pageNumber, this.pageSize).subscribe(res => {
      this.countries = {
      dataItems: res.body as Country[],
      pagination:JSON.parse(res.headers.get('Pagination')!)
    }
    });
  }


  CancelCountryEdit(){
    this.editMode=false;
    this.countryForm?.controls['name'].setValue("");
  }

  initSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((filterValue) => {
      console.log(filterValue);
      this.LoadCountries();
    });
  }

  onCountryNameSearch(){
    this.searchSubject.next(this.countryNameSearch);
  }

  openMyConfirmDialog(event:any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete this country',
        confirmButtonText:'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeCountry(event)
      }
    });
  }


  pageChanged($event: any) {
    if(this.pageNumber!==$event.page){
      this.pageNumber=$event.page;
      this.LoadCountries();
    }
  }
}
