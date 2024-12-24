import {Component, inject, ViewChild} from '@angular/core';
import {VehicleService} from '../../services/vehicle.service';
import {VehiclesDto} from '../../Models/VehiclesDto';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-vehicle-overview',
  templateUrl: './vehicle-overview.component.html',
  styleUrl: './vehicle-overview.component.css'
})

export class VehicleOverviewComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngOnInit(){
    this.loadVehicles();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  formIsClosed : boolean = true;
  ServiceVehicle = inject(VehicleService);
  vehicles: VehiclesDto[] = [];
  dataSource = new MatTableDataSource<VehiclesDto>([]);
  displayedColumns: string[] = ['No.', 'Id', 'ModelName', 'BrandName', 'Actions'];
  uniqueBrands: string[] = [];

  formVehicle: any = {
    modelName: '',
    vehicleBrandName: ''
  };

  updateFormVehicle: any = {
    updateModelName: '',
    newModelName: '',
    updateBrandName: '',
    newBrandName: ''
  }

  applyFilter(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const brand = selectElement.value; // Safely access the value
    console.log('Filtering by brand:', brand);

    if (brand) {
      this.dataSource.data = this.vehicles.filter(
        (vehicle) => vehicle.vehicleBrand.brandName === brand
      );
    } else {
      this.dataSource.data = this.vehicles;
    }
  }

  updateFormIsClosed: boolean = true;

  loadVehicles() {
    this.ServiceVehicle.LoadVehicles().subscribe({
      next: data => {
        this.vehicles = (data as VehiclesDto[]).map((v: any) => ({
          id: v.id,
          modelName: v.modelName,
          vehicleBrand: {
            id: v.vehicleBrand.id,
            brandName: v.vehicleBrand.brandName
          }
        }))
        this.dataSource.data = this.vehicles;
        this.uniqueBrands = [...new Set(this.vehicles.map((v) => v.vehicleBrand.brandName))];
        console.log(this.vehicles);
      },
      error: error => console.error('Error loading vehicles:', error)
    });
  }

  openForm() {
    this.formIsClosed = !this.formIsClosed
    this.formVehicle.modelName = '';
    this.formVehicle.vehicleBrandName = '';
  }

  submitVehicleForm() {
    this.ServiceVehicle.AddVehicle(this.formVehicle).subscribe({
      next: () => {
        console.log('Vehicle added successfully');
        this.loadVehicles(); // Refresh vehicle list
        location.reload()
        this.formIsClosed = true; // Close the form after success
      },
      error: (error) => {
        console.error('There was an error adding the vehicle:', error);
      }
    });
  }

  submitUpdateForm() {
    this.ServiceVehicle.UpdateVehicle(this.updateFormVehicle).subscribe({
      next: () => {
        console.log('Vehicle updated successfully');
        this.loadVehicles(); // Refresh vehicle list
        this.updateFormIsClosed = true; // Close the form after success
        this.formVehicle.modelName = '';
        this.formVehicle.vehicleBrandName = '';
      },
      error: (error) => {
        console.error('There was an error updating the vehicle:', error);
      }
    });
  }

  cancelAddForm() {
    this.formIsClosed = !this.formIsClosed
    location.reload();
  }

  editVehicle(vehicle: VehiclesDto) {
    // Set the fields for updating
    this.updateFormVehicle.updateModelName = vehicle.modelName;
    this.updateFormVehicle.updateBrandName = vehicle.vehicleBrand.brandName;

    this.updateFormVehicle.newModelName = vehicle.modelName;
    this.updateFormVehicle.newBrandName = vehicle.vehicleBrand.brandName;

    // Open the update form
    this.updateFormIsClosed = !this.updateFormIsClosed;
  }

  deleteVehicle(number: number) {
    if(window.confirm("Are you sure you want to delete this vehicle?")){
    this.ServiceVehicle.DeleteVehicle(number).subscribe({
      next: () => {
        console.log('Vehicle deleted successfully');
        this.loadVehicles(); // Refresh vehicle list
        location.reload();
      },

      error: (error) => {
        console.error('There was an error deleting the vehicle:', error);
      }
    });
    }
  }

  cancelUpdateForm() {
    this.updateFormIsClosed = !this.updateFormIsClosed
    location.reload();
  }
}


