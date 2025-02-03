import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { VehicleListingService } from '../../services/vehiclelisting.service';
import { UserDto } from '../../Models/UserDto';
import { VehicleDto } from '../../Models/VehicleDto';

@Component({
  selector: 'app-my-vehicles',
  templateUrl: './my-vehicles.component.html',
  styleUrl: './my-vehicles.component.css'
})
export class MyVehiclesComponent implements OnInit {
  user: UserDto | null = null;
  vehicles: VehicleDto[] = [];
  searchText: string = '';
  availabilityFilter: string = 'all';

  constructor(
    private userService: UserService,
    private vehicleService: VehicleListingService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (this.user) {
      this.loadUserVehicles();
    }
  }

  loadUserVehicles(): void {
    this.vehicleService.getVehiclesByUser(this.user!.id).subscribe((data) => {
      this.vehicles = data;
    });
  }

  get filteredVehicles(): VehicleDto[] {
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

  changeImage(direction: number): void {
    // Implement image scroll functionality if you want to allow multiple images per vehicle.
    console.log('Image change:', direction);
  }
}
