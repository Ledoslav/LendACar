import { Component, inject, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import {VehicleService} from '../../services/vehicle.service';
import {VehiclesDto} from '../../Models/VehiclesDto';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';


@Component({
  standalone: false,
  selector: 'app-vehicle-overview',
  templateUrl: './vehicle-overview.component.html',
  styleUrl: './vehicle-overview.component.css'
})

export class VehicleOverviewComponent implements OnInit, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngOnInit() {
    this.noResults = false;
    this.resultCount = 0;
    this.loadVehicles();

    combineLatest([
      this.search$.pipe(debounceTime(300), startWith('')),
      this.brand$.pipe(startWith('')),
      this.model$.pipe(startWith('')),
      this.hasImage$.pipe(startWith(false)),
      this.vehicleId$.pipe(startWith(null)),
    ])
      .pipe(
        map(([search, brand, model, hasImage, vehicleId]) =>
          this.vehicles.filter(vehicle => {

            const textMatch =
              vehicle.modelName.toLowerCase().includes(search) ||
              vehicle.vehicleBrand.brandName.toLowerCase().includes(search);

            const brandMatch = brand ? vehicle.vehicleBrand.brandName === brand : true;
            const modelMatch = model ? vehicle.modelName === model : true;
            const imageMatch = hasImage ? !!vehicle.vehicleBrand.icon : true;
            const idMatch = vehicleId ? vehicle.id === vehicleId : true;

            return textMatch && brandMatch && modelMatch && imageMatch && idMatch;
          })
        )
      )
      .subscribe(filtered => {
        this.dataSource.data = filtered;
        this.resultCount = filtered.length;
        this.noResults = filtered.length === 0;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }
      
    this.cdr.detectChanges();
  });
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
  search$ = new Subject<string>();
  brand$ = new Subject<string>();
  model$ = new Subject<string>();
  hasImage$ = new Subject<boolean>();
  vehicleId$ = new Subject<number | null>();

  noResults = false;
  resultCount = 0;


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
      next: (data: VehiclesDto[]) => {
        this.vehicles = data.map(v => ({
          ...v,
          vehicleBrand: {
            ...v.vehicleBrand,
            icon: v.vehicleBrand.icon
              ? `data:image/png;base64,${v.vehicleBrand.icon}`
              : undefined
          }
        }));

        this.dataSource.data = this.vehicles;

        this.uniqueBrands = [
          ...new Set(this.vehicles.map(v => v.vehicleBrand.brandName))
        ];

        this.updateFilteredModels();

        // Reset filters
        this.search$.next('');
        this.brand$.next('');
        this.model$.next('');
        this.hasImage$.next(false);
        this.vehicleId$.next(null);
      },
      error: err => {}
    });
  }

  private base64ToByteArray(base64: string): Uint8Array {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const byteChars = atob(base64Data);
    const byteNumbers = Array.from(byteChars).map(c => c.charCodeAt(0));
    return new Uint8Array(byteNumbers);
  }


  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.search$.next(value);
  }

  onBrandChange(value: string) {
    this.filter.brandName = value;
    this.brand$.next(value);
    this.updateFilteredModels();
  }


  onModelChange(value: string) {
    this.model$.next(value);
  }

  onHasImageChange(value: boolean) {
    this.hasImage$.next(value);
  }

  onVehicleIdChange(value: string) {
    const parsedValue = value ? Number(value) : null;

    if (value && isNaN(Number(parsedValue))) {
      return;
    }

    this.vehicleId$.next(parsedValue);
  }

  updateFilteredModels() {
    if (this.filter.brandName) {
      this.filteredModels = [
        ...new Set(
          this.vehicles
            .filter((v) => v.vehicleBrand.brandName === this.filter.brandName)
            .map((v) => v.modelName)
        ),
      ];
    } else {
      this.filteredModels = [
        ...new Set(this.vehicles.map((v) => v.modelName)),
      ];
    }
  }


  openForm() {
    this.formIsClosed = !this.formIsClosed
    this.formVehicle.modelName = '';
    this.formVehicle.vehicleBrandName = '';
  }

  submitVehicleForm() {
    const payload: any = {
      ModelName: this.formVehicle.modelName,
      BrandName: this.formVehicle.vehicleBrandName,
      Icon: null
    };

    if (this.formVehicle.icon) {
      const base64 = this.formVehicle.icon.split(',')[1];
      payload.Icon = base64;
    }

    this.ServiceVehicle.AddVehicle(payload).subscribe({
      next: () => {
        this.loadVehicles();
        this.formIsClosed = true;
        this.resetAddForm();
      },
      error: (error) => {}
    });
  }


  submitUpdateForm() {
    const payload: any = {
      ModelName: this.updateFormVehicle.updateModelName,
      BrandName: this.updateFormVehicle.updateBrandName,
      newModelName: this.updateFormVehicle.newModelName,
      newBrandName: this.updateFormVehicle.newBrandName,
      Icon: null
    };

    if (this.updateFormVehicle.icon) {
      const base64 = this.updateFormVehicle.icon.split(',')[1];
      payload.Icon = base64;
    }

    this.ServiceVehicle.UpdateVehicle(payload).subscribe({
      next: () => {
        this.loadVehicles();
        this.updateFormIsClosed = true;
        this.resetUpdateForm();
      },
      error: (error) => {
        // Error handling potentially already covered by interceptor
      }
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
    this.updateFormVehicle.updateModelName = vehicle.modelName;
    this.updateFormVehicle.updateBrandName = vehicle.vehicleBrand.brandName;

    this.updateFormVehicle.newModelName = vehicle.modelName;
    this.updateFormVehicle.newBrandName = vehicle.vehicleBrand.brandName;

    this.updateFormVehicle.icon = vehicle.vehicleBrand.icon
      ? 'data:image/png;base64,' + vehicle.vehicleBrand.icon
      : '';

    this.updateFormIsClosed = !this.updateFormIsClosed;
  }

  deleteVehicle(number: number) {
    if(window.confirm("Are you sure you want to delete this vehicle?")){
      this.ServiceVehicle.DeleteVehicle(number).subscribe({
        next: () => {
          this.loadVehicles(); // Refresh vehicle list
          location.reload();
        },

        error: (error) => {
          // Error handling potentially already covered by interceptor
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
      this[formKey].icon = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  deleteBrand(number: number,name: string) {
    if(window.confirm("Are you sure you want to delete the ${name} brand? It will delete every model associated with this brand.")){
      this.ServiceVehicle.DeleteBrand(number).subscribe({
        next: () => {
          this.loadVehicles();
          location.reload();
        },

        error: (error) => {
          // Error handling potentially already covered by interceptor
        }

      });
    }
  }
}
