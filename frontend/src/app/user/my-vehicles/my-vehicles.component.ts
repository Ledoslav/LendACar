import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { VehicleListingService } from '../../services/vehiclelisting.service';
import { UserDto } from '../../Models/UserDto';
import { VehicleDto, VehicleWithImagesDto } from '../../Models/VehicleDto';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-my-vehicles',
  templateUrl: './my-vehicles.component.html',
  styleUrls: ['./my-vehicles.component.css']
})
export class MyVehiclesComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  user: UserDto | null = null;
  vehicles: VehicleWithImagesDto[] = [];
  searchText: string = '';
  availabilityFilter: string = 'all';
  
  // Track currently displayed image for each vehicle
  vehicleImageIndexes: { [vehicleId: number]: number } = {};

  constructor(
    private userService: UserService,
    private vehicleService: VehicleListingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (this.user) {
      this.loadUserVehicles();
    }
  }

  loadUserVehicles(): void {
    this.vehicleService.getVehiclesByUserWithImages(this.user!.id).subscribe((data) => {
      this.vehicles = data;
      // Initialize image indexes
      this.vehicles.forEach(v => {
        this.vehicleImageIndexes[v.id] = 0;
      });
      console.log(this.vehicles);
    
    this.cdr.detectChanges();
  });

  }

  get filteredVehicles(): VehicleWithImagesDto[] {
    let filtered = this.vehicles;

    if (this.searchText) {
      filtered = filtered.filter((vehicle) =>
        vehicle.title.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    if (this.availabilityFilter === 'available') {
      filtered = filtered.filter((vehicle) => vehicle.avaliable);
    } else if (this.availabilityFilter === 'unavailable') {
      filtered = filtered.filter((vehicle) => !vehicle.avaliable);
    }

    return filtered;
  }

  getCurrentImage(vehicle: VehicleWithImagesDto): string {
    const index = this.vehicleImageIndexes[vehicle.id] || 0;
    return vehicle.vehicleImages?.length
      ? vehicle.vehicleImages[index].imageUrl
      : 'Image-not-found.png'; // fallback image
  }

  changeImage(vehicle: VehicleWithImagesDto, direction: number): void {
    if (!vehicle.vehicleImages || vehicle.vehicleImages.length === 0) return;

    let currentIndex = this.vehicleImageIndexes[vehicle.id] || 0;
    currentIndex += direction;

    // Loop around
    if (currentIndex < 0) currentIndex = vehicle.vehicleImages.length - 1;
    if (currentIndex >= vehicle.vehicleImages.length) currentIndex = 0;

    this.vehicleImageIndexes[vehicle.id] = currentIndex;
  }

  goToVehicle(vehicleId: number) {
    this.router.navigate(['/vehicle/listing', vehicleId]);
  }
}
