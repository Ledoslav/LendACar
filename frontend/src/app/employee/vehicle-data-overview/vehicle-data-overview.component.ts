import { Component, OnInit, inject } from '@angular/core';
import { VehicleOverviewService, VehicleOverviewDto, VehicleOverviewFilterOptionsDto, VehicleOverviewPagingRequest } from '../../services/vehicle-overview.service';

@Component({
  standalone: false,
  selector: 'app-vehicle-data-overview',
  templateUrl: './vehicle-data-overview.component.html',
  styleUrls: ['./vehicle-data-overview.component.css']
})
export class VehicleDataOverviewComponent implements OnInit {
  private vehicleOverviewService = inject(VehicleOverviewService);

  vehicles: VehicleOverviewDto[] = [];
  filterOptions: VehicleOverviewFilterOptionsDto = {
    owners: [],
    brands: [],
    cities: [],
    categories: []
  };

  request: VehicleOverviewPagingRequest = {
    pageNumber: 1,
    pageSize: 5,
    search: '',
    sortOrder: 'newest'
  };

  totalCount = 0;
  totalPages = 0;

  fuelTypes = [
    { id: 0, name: 'PROFILE.TYPES.PETROL' },
    { id: 1, name: 'PROFILE.TYPES.DIESEL' },
    { id: 2, name: 'PROFILE.TYPES.ELECTRIC' },
    { id: 3, name: 'PROFILE.TYPES.HYBRID' },
    { id: 4, name: 'PROFILE.TYPES.LPG' },
    { id: 5, name: 'PROFILE.TYPES.CNG' }
  ];

  transmissionTypes = [
    { id: 0, name: 'PROFILE.TYPES.MANUAL' },
    { id: 1, name: 'PROFILE.TYPES.AUTOMATIC' },
    { id: 2, name: 'PROFILE.TYPES.AUTOMATED_MANUAL' },
    { id: 3, name: 'PROFILE.TYPES.DCT' },
    { id: 4, name: 'PROFILE.TYPES.CVT' }
  ];

  sortOptions = [
    { id: 'newest', name: 'Newest' },
    { id: 'oldest', name: 'Oldest' },
    { id: 'price_asc', name: 'Price: Low to High' },
    { id: 'price_desc', name: 'Price: High to Low' },
    { id: 'res_asc', name: 'Reservations: Low to High' },
    { id: 'res_desc', name: 'Reservations: High to Low' }
  ];

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadVehicles();
  }

  loadFilterOptions(): void {
    this.vehicleOverviewService.getFilterOptions().subscribe(options => {
      this.filterOptions = options;
    });
  }

  loadVehicles(): void {
    this.vehicleOverviewService.getPagedVehicles(this.request).subscribe(response => {
      this.vehicles = response.data;
      this.totalCount = response.totalCount;
      this.totalPages = Math.ceil(this.totalCount / this.request.pageSize);
    });
  }

  onFilterChange(): void {
    this.request.pageNumber = 1;
    this.loadVehicles();
  }

  onSearch(): void {
    this.request.pageNumber = 1;
    this.loadVehicles();
  }

  nextPage(): void {
    if (this.request.pageNumber < this.totalPages) {
      this.request.pageNumber++;
      this.loadVehicles();
    }
  }

  prevPage(): void {
    if (this.request.pageNumber > 1) {
      this.request.pageNumber--;
      this.loadVehicles();
    }
  }

  getFuelTypeName(type: number): string {
    const fuel = this.fuelTypes.find(f => f.id === type);
    return fuel ? fuel.name : 'PROFILE.TYPES.UNKNOWN';
  }

  getTransmissionTypeName(type: number): string {
    const trans = this.transmissionTypes.find(t => t.id === type);
    return trans ? trans.name : 'PROFILE.TYPES.UNKNOWN';
  }

  deleteVehicle(id: number): void {
    if (confirm('Are you sure you want to delete this vehicle listing? This action cannot be undone and will remove all associated reservations.')) {
      this.vehicleOverviewService.deleteVehicle(id).subscribe({
        next: () => {
          this.loadVehicles();
        },
        error: (err) => {
          alert('Failed to delete vehicle. Please try again.');
        }

      });
    }
  }
}
