import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryService } from '../../services/country.service';
import { CityService } from '../../services/city.service';
import { ReservationService } from '../../services/reservation.service';
import { VehicleListingService } from '../../services/vehiclelisting.service';
import { UserService } from '../../services/user.service';
import { UserDto } from '../../Models/UserDto';
import { VehicleWithImagesDto } from '../../Models/VehicleDto';
import { ReservationCreateDto, ReservationStatus } from '../../Models/ReservationDto';
import { Country } from '../../Models/Country';
import { City } from '../../Models/City';
import {ActivityCreateRequest, ActivityService} from '../../services/activity-service';

@Component({
  standalone: false,
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  user: UserDto | null = null;
  vehicle: VehicleWithImagesDto | null = null;
  vehicleId: number | null = null;
  today!: string;
  totalPrice: number = 0;

  // Form fields
  pickUpDateTime!: string;
  dropOffDateTime!: string;
  pickUpCountryId!: number;
  pickUpCityId!: number;
  dropOffCountryId!: number;
  dropOffCityId!: number;
  isCashPayment = true;

  countries: Country[] = [];
  pickUpCities: City[] = [];
  dropOffCities: City[] = [];

  constructor(
    private userService: UserService,
    private vehicleService: VehicleListingService,
    private reservationService: ReservationService,
    private countryService: CountryService,
    private cityService: CityService,
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
  ) {}

  ngOnInit(): void {
    if(this.userService.getCurrentUser() == null) {
      this.router.navigate(['/vehicle/listing/' + this.vehicleId]);
    }

    this.user = this.userService.getCurrentUser();
    const idParam = this.route.snapshot.paramMap.get('id');
    this.vehicleId = idParam ? +idParam : null;

    const now = new Date();
    this.today = now.toISOString().slice(0,16);

    if (this.vehicleId) {
      this.vehicleService.getVehicleByIdWithImages(this.vehicleId).subscribe({
        next: v => this.vehicle = v,
        error: err => console.error('Failed to load vehicle', err)
      });
    }

    if(this.user?.id == this.vehicle?.userID){
      this.router.navigate(['/vehicle/listing/' + this.vehicleId]);
    }

    this.countryService.getAllCountries().subscribe(c => this.countries = c);
  }

  loadPickUpCities() {
    if (!this.pickUpCountryId) return;
    this.cityService.GetAllCitiesByCountryId(this.pickUpCountryId).subscribe(c => this.pickUpCities = c);
  }

  loadDropOffCities() {
    if (!this.dropOffCountryId) return;
    this.cityService.GetAllCitiesByCountryId(this.dropOffCountryId).subscribe(c => this.dropOffCities = c);
  }

  get totalDays(): number {
    if (!this.pickUpDateTime || !this.dropOffDateTime) return 0;

    const pickUp = new Date(this.pickUpDateTime);
    const dropOff = new Date(this.dropOffDateTime);

    // Difference in milliseconds
    const diffMs = dropOff.getTime() - pickUp.getTime();

    // Convert to days, always round up to count partial days as full
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  updateTotalPrice(){
    if(this.pickUpDateTime == null || this.dropOffDateTime == null || this.vehicle?.pricePerDay == null)
      return;

    this.totalPrice = this.totalDays * this.vehicle?.pricePerDay!;
  }

  addActivity(_variant:number, _companyEmployeeId:number, _vehicleId:number, _newVehicleId:number){

    var activity:ActivityCreateRequest = {
      userId:Number(this.user?.id),
      variant: _variant,
      companyEmployeeId: _companyEmployeeId,
      vehicleId:_vehicleId,
      newVehicleId:_newVehicleId
    }

    this.activityService.create(activity).subscribe({
      next:(response:any) =>{
        console.log(response);
      },
      error:(err:any)=>{
        console.log(err);
      }
    })

  }


  cancel() {
    this.router.navigate(['/vehicle/listing/' + this.vehicleId]);
  }

  confirm() {
    if (!this.user || !this.vehicle) return;

    if (!confirm('Are you sure you want to create this reservation?')) return;

    const dto: ReservationCreateDto = {
      status: ReservationStatus.Pending,
      isCashPayment: this.isCashPayment,
      price: this.totalPrice,
      pickUpDateTime: this.pickUpDateTime,
      dropOffDateTime: this.dropOffDateTime,
      renterId: this.user.id,
      ownerId: this.vehicle.user.id,
      vehicleID: this.vehicle.id,
      pickUpCityID: this.pickUpCityId,
      dropOffCityID: this.dropOffCityId
    };

    this.addActivity(30,0,dto.vehicleID,0);

    this.reservationService.create(dto).subscribe({
      next: (res: any) => this.router.navigate(['/vehicle/reservation-success/' + res.id]),
      error: err => console.error('Reservation creation failed', err)
    });
  }
}
