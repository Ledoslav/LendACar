import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { VehicleListingService } from '../../services/vehiclelisting.service';
import { UserDto } from '../../Models/UserDto';
import { VehicleDto, VehicleWithImagesDto } from '../../Models/VehicleDto';
import { ActivatedRoute, Router } from '@angular/router';
import {ChatService} from '../../services/chat-service';
import {ChatApiService} from '../../services/chat-api.service';

@Component({
  standalone: false,
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
    private router: Router,
    private chatService: ChatService,
    private chatApi: ChatApiService,
    private cdr: ChangeDetectorRef
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
            this.cdr.detectChanges();
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

    // update main image alright
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
      return "VEHICLE.TYPES.UNKNOWN";
    }

    switch (transmissionId) {
      case 0: return "VEHICLE.TYPES.MANUAL";
      case 1: return "VEHICLE.TYPES.AUTOMATIC";
      case 2: return "VEHICLE.TYPES.AUTOMATED_MANUAL";
      case 3: return "VEHICLE.TYPES.DCT";
      case 4: return "VEHICLE.TYPES.CVT";
      default: return "VEHICLE.TYPES.UNKNOWN";
    }
  }

  public getACType(acId: number): string {
    if (acId === null || acId === undefined) {
      return "VEHICLE.TYPES.UNKNOWN";
    }

    switch (acId) {
      case 0: return "VEHICLE.TYPES.NONE";
      case 1: return "VEHICLE.TYPES.SINGLE_ZONE";
      case 2: return "VEHICLE.TYPES.DOUBLE_ZONE";
      case 3: return "VEHICLE.TYPES.TRIPLE_ZONE";
      case 4: return "VEHICLE.TYPES.QUAD_ZONE";
      default: return "VEHICLE.TYPES.UNKNOWN";
    }
  }

  public getFuelType(transmissionId: number): string {
    if (transmissionId === null || transmissionId === undefined) {
      return "VEHICLE.TYPES.UNKNOWN";
    }

    switch (transmissionId) {
      case 0: return "VEHICLE.TYPES.PETROL";
      case 1: return "VEHICLE.TYPES.DIESEL";
      case 2: return "VEHICLE.TYPES.ELECTRIC";
      case 3: return "VEHICLE.TYPES.HYBRID";
      case 4: return "VEHICLE.TYPES.LPG";
      case 5: return "VEHICLE.TYPES.CNG";
      default: return "VEHICLE.TYPES.UNKNOWN";
    }
  }

  getBrandIcon(): string {
    const icon = this.vehicle?.vehicleModel?.vehicleBrand?.icon;
    if (icon) {
      return `data:image/png;base64,${icon}`;
    }
    return 'generic_sedan.png';
  }


  openChat() {
    this.chatApi.startChat(Number(this.vehicle?.userID),Number(this.user?.id),this.vehicle?.user.username,String(this.vehicle?.title),Number(this.vehicle?.id),this.vehicle?.user.profilePhotoUrl, String(this.user?.username), String(this.user?.profilePhotoUrl)).subscribe({})
    this.router.navigate(['/chat']);
  }
}
