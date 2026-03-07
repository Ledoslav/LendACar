import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleListingService } from '../../services/vehiclelisting.service';
import { CityService } from '../../services/city.service';
import { CountryService } from '../../services/country.service';
import { VehicleCategoriesService, VehicleCategoryResponse } from '../../services/vehiclecategory.service';
import { VehicleService } from '../../services/vehicle.service';
import { VehiclesDto } from '../../Models/VehiclesDto';
import { UserService } from '../../services/user.service';
import { VehicleBrandDto } from '../../Models/VehicleBrandDto';
import { Country } from '../../Models/Country';
import { City } from '../../Models/City';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';


@Component({
  standalone: false,
  selector: 'app-vehicle-upload',
  templateUrl: './vehicle-upload.component.html',
  styleUrls: ['./vehicle-upload.component.css']
})
export class VehicleUploadComponent implements OnInit {


  fuelTypes = [
    { value: 0, label: 'Petrol' },
    { value: 1, label: 'Diesel' },
    { value: 2, label: 'Electric' },
    { value: 3, label: 'Hybrid' },
    { value: 4, label: 'LPG' },
    { value: 5, label: 'CNG' }
  ];
  transmissionTypes = [
    { value: 0, label: 'Manual' },
    { value: 1, label: 'Automatic' },
    { value: 2, label: 'AutomatedManual' },
    { value: 3, label: 'DCT' },
    { value: 4, label: 'CVT' }
  ];
  airConditioningOptions = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Single-Zone' },
    { value: 2, label: 'Double-Zone' },
    { value: 3, label: 'Triple-Zone' },
    { value: 4, label: 'Quad-Zone' }
  ];
  years = Array.from({ length: 81 }, (_, i) => 2025 - i);
  countries: Country[] | null=null; 
  cities: City[] | null = null; 
  vehicleModels: VehiclesDto[] | null=null; 
  vehicleBrands: VehicleBrandDto[] | null=null;
  vehicleCategories: VehicleCategoryResponse[] | null = null; 
  userID: number;
  uploadedImages: string[] = [];
  vehicleForm!: FormGroup;
  uploadedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleListingService,
    private vehicleModelsBrandsService: VehicleService,
    private cityService: CityService,
    private countryService: CountryService,
    private vehicleCategoryService: VehicleCategoriesService,
    private userService: UserService,
    private router: Router
  ) { 
    this.userID = userService.currentUser()?.id!;

    this.vehicleForm = this.fb.group({
      title: ['', Validators.required],
      vehicleBrandID: ['', Validators.required],
      vehicleModelID: ['', Validators.required],
      pricePerDay: ['', [Validators.required, Validators.min(1)]],
      fuelType: ['', Validators.required],
      transmissionType: [{ value: '', disabled: true }, Validators.required],
      engineDisplacement: ['', Validators.required],
      enginePower: ['', [Validators.required, Validators.min(1)]],
      airConditioning: ['', Validators.required],
      numberOfSeats: ['', Validators.min(1)],
      towingHitch: [false],
      productionYear: ['', Validators.required],
      description: [''],
      vehicleCategoryID: ['', Validators.required],
      cityID: ['', Validators.required],
      avaliable: [true, Validators.required],
      images: [[]]
    });
  }


  ngOnInit() {
    // Fetch data for vehicle categories, countries, and cities
    this.fetchData();
  }

  fetchData() {
    // Placeholder fetch logic - you will replace this with actual service calls
    this.vehicleCategoryService.getCategories().subscribe(categories => this.vehicleCategories = categories);
    this.vehicleModelsBrandsService.GetVehicleBrands().subscribe(brands => this.vehicleBrands = brands);
    this.countryService.getAllCountries().subscribe(countries => this.countries = countries);
    this.cityService.GetAllCities().subscribe(cities => this.cities = cities);
  }

  onFuelTypeChange() {
    const fuelType = this.vehicleForm.get('fuelType')?.value;
    if (fuelType === 2) { // If Electric, set transmission type to automatic and disable it
      this.vehicleForm.get('transmissionType')?.setValue(1);
      this.vehicleForm.get('transmissionType')?.disable();
    } else {
      this.vehicleForm.get('transmissionType')?.enable();
    }
  }

  onBrandChange() {
    // Fetch models based on selected brand - you will replace this with actual service logic
    let brandID = this.vehicleForm.get("vehicleBrandID")?.value;
    this.vehicleModelsBrandsService.GetVehicleModelsByBrandId(brandID).subscribe(models => this.vehicleModels = models);
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
  
      // Check if the total number of images exceeds the limit
      if (files.length + this.uploadedImages.length > 15) {
        alert('You can upload a maximum of 15 images.');
        return;
      }
  
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result as string;
          this.uploadedImages.push(result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];

      // Only allow images
      if (!file.type.startsWith('image/')) continue;

      // Max 15 images
      if (this.uploadedFiles.length >= 15) {
        alert('You can upload a maximum of 15 images.');
        break;
      }

      this.uploadedFiles.push(file);

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => this.uploadedImages.push(reader.result as string);
      reader.readAsDataURL(file);
    }
  }


  // Handle files dropped via drag-and-drop
  onFileDrop(event: any): void {
    if (!event.files) return;
    this.addFiles(event.files);
  }

  private addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      if (this.uploadedFiles.length >= 15) {
        alert('You can upload a maximum of 15 images.');
        break;
      }

      this.uploadedFiles.push(file);

      // Optional: preview the image
      const reader = new FileReader();
      reader.onload = () => this.uploadedImages.push(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
    this.uploadedFiles.splice(index, 1);
  }

  onSubmit() {
    if (!this.vehicleForm.valid) return;

    const formData = new FormData();

    // Append all vehicle fields (skip 'images')
    Object.entries(this.vehicleForm.value).forEach(([key, value]) => {
      if (key === 'images') return;
      if (typeof value === 'boolean') value = value.toString();
      formData.append(key, value as string | Blob);
    });

    // Append userID
    formData.append('userID', this.userID.toString());

    // Append actual files (full resolution)
    this.uploadedFiles.forEach(file => formData.append('images', file, file.name));

    this.vehicleService.uploadVehicleWithImages(formData).subscribe({
      next: response => {
        console.log('Vehicle uploaded successfully:', response);
        void this.router.navigateByUrl('/user/myVehicles');
      },
      error: err => console.error('Upload failed:', err)
    });
  }



}
