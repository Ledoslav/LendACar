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
  displayedColumns: string[] = ['No.', 'Id', 'ModelName', 'BrandName','Icon', 'Actions'];
  uniqueBrands: string[] = [];
  [key: string]: any; // Add this line to add an index signature
  models: string[] = [];
  filteredModels: string[] = []; // Filtered models based on the selected brand

  filter = {
    vehicleId: null,
    brandName: '',
    modelName: '',
    hasImage: false,
  };

  formVehicle: any = {
    modelName: '',
    vehicleBrandName: '',
    icon: ''
  };

  updateFormVehicle: any = {
    updateModelName: '',
    newModelName: '',
    updateBrandName: '',
    newBrandName: '',
    icon: ''
  }

  applyFilters() {
    this.dataSource.data = this.vehicles.filter((vehicle) => {
      const matchesVehicleId = this.filter.vehicleId ? vehicle.id === this.filter.vehicleId : true;
      const matchesBrand = this.filter.brandName ? vehicle.vehicleBrand.brandName === this.filter.brandName : true;
      const matchesModelName = this.filter.modelName ? vehicle.modelName.includes(this.filter.modelName) : true;
      const matchesHasImage = this.filter.hasImage ? !!vehicle.vehicleBrand.icon : true;

      return matchesVehicleId && matchesBrand && matchesModelName && matchesHasImage;
    });
    this.dataSource.paginator?.firstPage(); // Reset to the first page
  }


  updateFormIsClosed: boolean = true;

  loadVehicles() {
    this.ServiceVehicle.LoadVehicles().subscribe({
      next: (data) => {
        console.log('Raw API response:', data);

        this.vehicles = data as VehiclesDto[];
        this.dataSource.data = this.vehicles;

        // Extract unique brand names
        this.uniqueBrands = [
          ...new Set(this.vehicles.map((v) => v.vehicleBrand.brandName)),
        ];

        // Update filtered models based on selected brand
        this.updateFilteredModels();

        console.log('Loaded Vehicles:', this.vehicles);
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
      },
    });
  }


  onBrandChange() {
    // Update filtered models when the brand changes
    this.updateFilteredModels();
    this.applyFilters();
  }

  updateFilteredModels() {
    if (this.filter.brandName) {
      // Filter models by selected brand
      this.filteredModels = [
        ...new Set(
          this.vehicles
            .filter((vehicle) => vehicle.vehicleBrand.brandName === this.filter.brandName)
            .map((vehicle) => vehicle.modelName)
        ),
      ];
    } else {
      // Show all models when no brand is selected
      this.filteredModels = [
        ...new Set(this.vehicles.map((vehicle) => vehicle.modelName)),
      ];
    }
  }


  openForm() {
    this.formIsClosed = !this.formIsClosed
    this.formVehicle.modelName = '';
    this.formVehicle.vehicleBrandName = '';
  }

  submitVehicleForm() {
    if (this.formVehicle.icon) {
      const base64Icon = this.formVehicle.icon.split(',')[1]; // Extract Base64 string
      this.formVehicle.icon = base64Icon;
    }

    this.ServiceVehicle.AddVehicle(this.formVehicle).subscribe({
      next: () => {
        console.log('Vehicle added successfully');
        this.loadVehicles(); // Refresh vehicle list
        this.formIsClosed = true; // Close the form after success
        this.resetAddForm(); // Reset form fields
      },
      error: (error) => {
        console.error('There was an error adding the vehicle:', error);
      },
    });
  }


  submitUpdateForm() {
    if (this.updateFormVehicle.icon) {
      const base64Icon = this.updateFormVehicle.icon.split(',')[1]; // Extract Base64 string
      this.updateFormVehicle.icon = base64Icon;
    }

    const updatedVehicleData = {
      updateModelName: this.updateFormVehicle.updateModelName,
      newModelName: this.updateFormVehicle.newModelName,
      updateBrandName: this.updateFormVehicle.updateBrandName,
      newBrandName: this.updateFormVehicle.newBrandName,
      icon: this.updateFormVehicle.icon // Ensure this property matches the backend
    };

    this.ServiceVehicle.UpdateVehicle(updatedVehicleData).subscribe({
      next: () => {
        console.log('Vehicle updated successfully');
        this.loadVehicles(); // Refresh vehicle list
        this.updateFormIsClosed = true; // Close the form after success
        this.resetUpdateForm(); // Reset form fields
      },
      error: (error) => {
        console.error('There was an error updating the vehicle:', error);
      },
    });
  }


  resetAddForm() {
    this.formVehicle = {
      modelName: '',
      vehicleBrandName: '',
      icon: '',
    };
  }

  resetUpdateForm() {
    this.updateFormVehicle = {
      updateModelName: '',
      newModelName: '',
      updateBrandName: '',
      newBrandName: '',
      icon: '',
    };
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

    this.updateFormVehicle.icon = vehicle.vehicleBrand.icon
      ? 'data:image/png;base64,' + vehicle.vehicleBrand.icon
      : '';

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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent, formKey: string): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files?.length) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file, formKey);
    }
  }

  onIconChange(event: Event, formKey: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.handleFile(file, formKey);
    }
  }

  private handleFile(file: File, formKey: string): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this[formKey].icon = e.target.result; // Update the form icon with the Base64 string
    };
    reader.readAsDataURL(file);
  }

  searchTerm: string = ''; // Store the search term

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase(); // Convert to lowercase for case-insensitive matching

    this.dataSource.data = this.vehicles.filter((vehicle) => {
      const brandName = vehicle.vehicleBrand.brandName.toLowerCase();
      const modelName = vehicle.modelName.toLowerCase();
      return brandName.includes(this.searchTerm) || modelName.includes(this.searchTerm);
    });

    this.dataSource.paginator?.firstPage(); // Reset to the first page
  }


  deleteBrand(number: number,name: string) {
    if(window.confirm("Are you sure you want to delete the ${name} brand? It will delete every model associated with this brand.")){
      this.ServiceVehicle.DeleteBrand(number).subscribe({
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
}
