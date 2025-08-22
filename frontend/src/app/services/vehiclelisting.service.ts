import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { VehicleDto } from '../Models/VehicleDto';
import { Observable } from 'rxjs';
import { MyConfig } from '../my-config';

export interface VehicleUploadDto {
  title: string;
  engineDisplacement: number;
  enginePower: number;
  transmissionType: number; // 0 - Manual, 1 - Automatic, 2 - AutomatedManual, 3 - DCT, 4 - CVT
  fuelType: number; // 0 - Petrol , 1 - Diesel, 2 - Electric, 3 - Hybrid, 4 - LPG, 5 - CNG
  airConditioning: number; // 0 - None, 1 - Single-Zone, 2 - Double-Zone, 3 - Triple-Zone, 4 - Quad-Zone
  numberOfSeats: number;
  towingHitch: boolean;
  description: string;
  productionYear: number;
  avaliable: boolean;
  averageRating: number;
  pricePerDay: number;
  vehicleCategoryID: number;
  vehicleModelID: number;
  userID: number;
  cityID: number;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleListingService {

  private baseUrl = MyConfig.api_address + '';

  constructor(private http: HttpClient) {}

  // Get all vehicles by user ID
  getVehiclesByUser(userId: number): Observable<VehicleDto[]> {
    return this.http.get<VehicleDto[]>(`${this.baseUrl}vehicle/getByUser/${userId}`);
  }

  getVehiclesByCompanyAdminEmail(userId: number, companyAdminEmail: string | null): Observable<VehicleDto[]> {
    let params = new HttpParams().set('userId', userId.toString());

    if (companyAdminEmail) {
      params = params.set('companyAdminEmail', companyAdminEmail);
    }

    return this.http.get<VehicleDto[]>(`${this.baseUrl}vehicle/getByCompanyAdminEmail`, { params });
  }

  getCompanyAdminUserId(userId: number, companyAdminEmail: string | null): Observable<number> {
    let params = new HttpParams().set('userId', userId.toString());

    if (companyAdminEmail) {
      params = params.set('companyAdminEmail', companyAdminEmail);
    }

    // Make HTTP GET request and specify the type as number
    return this.http.get<number>(`${this.baseUrl}vehicle/getCompanyAdminUserId`, { params });
  }

  // Get a vehicle by ID
  getVehicleById(vehicleId: number): Observable<VehicleDto> {
    return this.http.get<VehicleDto>(`${this.baseUrl}vehicle/getById/${vehicleId}`);
  }

  // Upload a new vehicle
  uploadVehicle(vehicle: VehicleUploadDto): Observable<VehicleUploadDto> {
    return this.http.post<VehicleDto>(`${this.baseUrl}vehicle/addNew`, vehicle);
  }

  // Update an existing vehicle
  updateVehicle(vehicleId: number, vehicle: VehicleDto): Observable<VehicleDto> {
    return this.http.put<VehicleDto>(`${this.baseUrl}vehicle/update/${vehicleId}`, vehicle);
  }

  // Delete a vehicle
  deleteVehicle(vehicleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}vehicle/remove/${vehicleId}`);
  }

  // Filter vehicles by availability and title (this can be modified for advanced filtering)
  filterVehicles(availability: string, title: string): Observable<VehicleDto[]> {
    let params = new HttpParams();
    if (availability) {
      params = params.set('availability', availability);
    }
    if (title) {
      params = params.set('title', title);
    }

    return this.http.get<VehicleDto[]>(`${this.baseUrl}vehicle/filter`, { params });
  }
}
