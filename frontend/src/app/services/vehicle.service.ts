import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VehiclesDto} from '../Models/VehiclesDto';
import { VehicleBrandDto } from '../Models/VehicleBrandDto';
import {VehicleDto} from '../Models/VehicleDto';
import { MyConfig } from '../my-config';

interface pagingRequest{
  pageNumber: number;
  pageSize: number;
  search: string;
  fromPrice: number;
  toPrice: number;
  last24Active: boolean;
  last7Active: boolean;
  lastMonthActive: boolean;
  manualTransActive: boolean;
  automaticTransActive: boolean;
  petrolActive: boolean;
  dieselActive: boolean;
  otherFuelActive: boolean;
  specialOffersActive: boolean;
  specialEquipmentActive: boolean;
  availableActive:boolean;
  allDateActive: boolean;
  allTransActive: boolean;
  allFuelActive: boolean;
  pickUpLocation: number;
  dropOffLocation: number;
  country: number;
  pickUpDate: string;
  dropOffDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private baseUrl = MyConfig.api_address + ''; // Ensure api_address ends with /

  GetVehicleBrands(): Observable<VehicleBrandDto[]> {
    return this.http.get<VehicleBrandDto[]>(`${this.baseUrl}VehicleModelAndBrand/getBrand/all`);
  }

  GetVehicleModelsByBrandId(brandId: number): Observable<VehiclesDto[]> {
    return this.http.get<VehiclesDto[]>(`${this.baseUrl}VehicleModelAndBrand/getModelsByBrandId/${brandId}`);
  }

  getVehicle(paging: pagingRequest): Observable<VehicleDto[]> {
    let params = new HttpParams()
      .set('PageNumber', paging.pageNumber)
      .set('PageSize', paging.pageSize)
      .set('Search', paging.search)
      .set('FromPrice', paging.fromPrice)
      .set('ToPrice', paging.toPrice)
      .set('AllDateActive', String(paging.allDateActive))
      .set('Last24Active', String(paging.last24Active))
      .set('Last7Active', String(paging.last7Active))
      .set('LastMonthActive', String(paging.lastMonthActive))
      .set('AllTransActive', String(paging.allTransActive))
      .set('ManualTransActive', String(paging.manualTransActive))
      .set('AutomaticTransActive', String(paging.automaticTransActive))
      .set('AllFuelActive', String(paging.allFuelActive))
      .set('PetrolActive', String(paging.petrolActive))
      .set('DieselActive', String(paging.dieselActive))
      .set('OtherFuelActive', String(paging.otherFuelActive))
      .set('SpecialOffersActive', String(paging.specialOffersActive))
      .set('AvailableActive', String(paging.availableActive))
      .set('PickUpLocation', String(paging.pickUpLocation))
      .set('DropOffLocation', String(paging.dropOffLocation))
      .set('Country', String(paging.country))
      .set('SpecialEquipmentActive', String(paging.specialEquipmentActive));

    return this.http.get<VehicleDto[]>(`${this.baseUrl}Vehicle/get`, { params });
  }

  LoadVehicles(): Observable<VehiclesDto[]> {
    return this.http.get<VehiclesDto[]>(`${this.baseUrl}VehicleModelAndBrand/getModel/all`);
  }

  AddVehicleFormData(formData: FormData) {
    return this.http.post(this.baseUrl + 'VehicleModelAndBrand/add', formData
    );
  }

  AddVehicle(vehicleData: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + 'VehicleModelAndBrand/add',
      vehicleData,
      { headers: { 'Content-Type': 'application/json' } } // JSON
    );
  }

  UpdateVehicle(vehicleData: any): Observable<any> {
    return this.http.put<any>(
      this.baseUrl + 'VehicleModelAndBrand/update/vehicle',
      vehicleData,
      { headers: { 'Content-Type': 'application/json' } } // JSON
    );
  }

  DeleteVehicle(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}VehicleModelAndBrand/deleteModel/${id}`);
  }

  DeleteBrand(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}VehicleModelAndBrand/deleteBrand/${id}`);
  }

  LoadVehiclesWithFilters(params: any): Observable<VehiclesDto[]> {
    const queryParams = new URLSearchParams(params).toString();
    return this.http.get<VehiclesDto[]>(`${this.baseUrl}VehicleModelAndBrand/getModel/all?${queryParams}`);
  }

  GetVehiclesByUser(userId: any): Observable<VehicleDto[]> {
    return this.http.get<VehicleDto[]>(`${this.baseUrl}Vehicle/getByUser/${userId}`);
  }
}
