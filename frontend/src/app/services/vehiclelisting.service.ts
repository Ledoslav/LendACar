import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { VehicleDto } from '../Models/VehicleDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleListingService {

  private baseUrl: string = 'http://localhost:7000/api/';
  
  constructor(private http: HttpClient) {}

  // Get all vehicles by user ID
  getVehiclesByUser(userId: number): Observable<VehicleDto[]> {
    return this.http.get<VehicleDto[]>(`${this.baseUrl}vehicle/getByUser/${userId}`);
  }

  // Get a vehicle by ID
  getVehicleById(vehicleId: number): Observable<VehicleDto> {
    return this.http.get<VehicleDto>(`${this.baseUrl}vehicle/getById/${vehicleId}`);
  }

  // Upload a new vehicle
  uploadVehicle(vehicle: VehicleDto): Observable<VehicleDto> {
    return this.http.post<VehicleDto>(`${this.baseUrl}vehicle/upload`, vehicle);
  }

  // Update an existing vehicle
  updateVehicle(vehicleId: number, vehicle: VehicleDto): Observable<VehicleDto> {
    return this.http.put<VehicleDto>(`${this.baseUrl}vehicle/update/${vehicleId}`, vehicle);
  }

  // Delete a vehicle
  deleteVehicle(vehicleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}vehicle/delete/${vehicleId}`);
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
