import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { VehicleListingService } from '../../services/vehiclelisting.service';
import { UserDto } from '../../Models/UserDto';
import { VehicleDto, VehicleWithImagesDto } from '../../Models/VehicleDto';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-listing',
  templateUrl: './vehicle-listing.html',
  styleUrls: ['./vehicle-listing.css']
})
export class VehicleListingComponent implements OnInit {
  @ViewChild('thumbnailsContainer') thumbnailsContainer!: ElementRef<HTMLDivElement>;
  user: UserDto | null = null;
  vehicle: VehicleWithImagesDto | null = null;
  vehicleId: number | null = null;
  selectedImageIndex = 0;


  constructor(
    private userService: UserService,
    private vehicleService: VehicleListingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

    const idParam = this.route.snapshot.paramMap.get('id');
    this.vehicleId = idParam ? +idParam : null;

    if (this.vehicleId) {
      this.vehicleService.getVehicleByIdWithImages(this.vehicleId)
        .subscribe({
          next: (vehicle) => {
            this.vehicle = vehicle; // save the data
            console.log('Vehicle loaded:', vehicle);
          },
          error: (err) => {
            console.error('Failed to load vehicle', err);
          }
        });
    }
  }

  get selectedImageUrl(): string {
    if (this.vehicle?.vehicleImages?.length) {
      return this.vehicle.vehicleImages[this.selectedImageIndex].imageUrl;
    }
    return 'Image-not-found.png'; // fallback image
  }

  selectImage(index: number) {
    if (this.vehicle?.vehicleImages && index >= 0 && index < this.vehicle.vehicleImages.length) {
      this.selectedImageIndex = index;
      this.scrollThumbnailIntoView(index);
    }
  }

  scrollAmount = 100; // px to scroll per arrow click

  nextImage() {
    if (!this.vehicle?.vehicleImages?.length) return;

    // update main image
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.vehicle.vehicleImages.length;

    // scroll thumbnails container
    if (this.thumbnailsContainer) {
      this.thumbnailsContainer.nativeElement.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
    }

    console.log("next");
  }

  prevImage() {
    if (!this.vehicle?.vehicleImages?.length) return;

    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.vehicle.vehicleImages.length) % this.vehicle.vehicleImages.length;

    if (this.thumbnailsContainer) {
      this.thumbnailsContainer.nativeElement.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
    }
  }

  goToReservationForm(){
    this.router.navigate(['/vehicle/reservationForm/' + this.vehicleId]);
  }


  private scrollThumbnailIntoView(index: number) {
    if (!this.thumbnailsContainer) return;

    // wait until the DOM is rendered
    setTimeout(() => {
      const container = this.thumbnailsContainer.nativeElement;
      const thumbnail = container.children[index] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    });
  }

  public getTransmissionType(transmissionId: number): string {
    if (transmissionId === null || transmissionId === undefined) {
      return "Unknown";
    }

    switch (transmissionId) {
      case 0: return "Manual";
      case 1: return "Automatic";
      case 2: return "AutomatedManual";
      case 3: return "DCT";
      case 4: return "CVT";
      default: return "Unknown";
    }
  }

  public getACType(transmissionId: number): string {
    if (transmissionId === null || transmissionId === undefined) {
      return "Unknown";
    }

    switch (transmissionId) {
      case 0: return "None";
      case 1: return "Single-Zone";
      case 2: return "Double-Zone";
      case 3: return "Triple-Zone";
      case 4: return "Quad-Zone";
      default: return "Unknown";
    }
  }

  public getFuelType(transmissionId: number): string {
    if (transmissionId === null || transmissionId === undefined) {
      return "Unknown";
    }

    switch (transmissionId) {
      case 0: return "Petrol";
      case 1: return "Diesel";
      case 2: return "Electric";
      case 3: return "Hybrid";
      case 4: return "LPG";
      case 5: return "CNG";
      default: return "Unknown";
    }
  }

  getBrandIcon(): string {
    const icon = this.vehicle?.vehicleModel?.vehicleBrand?.icon;
    if (icon) {
      return `data:image/png;base64,${icon}`;
    }
    return 'generic_sedan.png';
  }


}
