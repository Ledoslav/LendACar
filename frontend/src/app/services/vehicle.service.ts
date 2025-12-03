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
export class VehicleService{
  private http = inject(HttpClient);
  private baseUrl = MyConfig.api_address + '';

  GetVehicleBrands(){
    return this.http.get<VehicleBrandDto[]>("http://localhost:7000/api/VehicleModelAndBrand/getBrand/all");
  }

  GetVehicleModelsByBrandId(brandId:number){
    return this.http.get<VehiclesDto[]>( this.baseUrl + `VehicleModelAndBrand/getModelsByBrandId/${brandId}`);
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
      .set('AvailableActive', paging.availableActive)
      .set('PickUpLocation', paging.pickUpLocation)
      .set('DropOffLocation', paging.dropOffLocation)
      .set('Country', paging.country)
      .set('SpecialEquipmentActive', String(paging.specialEquipmentActive));

    return this.http.get<VehicleDto[]>(this.baseUrl + 'Vehicle/get', { params });
  }


  LoadVehicles(){
    return this.http.get("http://localhost:7000/api/VehicleModelAndBrand/getModel/all");
  }

  AddVehicle(vehicleData: any): Observable<any> {
    const payload = {
      modelName: vehicleData.modelName,
      BrandName: vehicleData.vehicleBrandName, // Use correct field name (case-sensitive)
      icon: vehicleData.icon ? `${vehicleData.icon}` : undefined,
    };
    console.log(JSON.stringify(payload));
    return this.http.post<any>(
      `http://localhost:7000/api/VehicleModelAndBrand/add`,
      payload, // Send JSON directly
      {
        headers: { 'Content-Type': 'application/json' } // Explicitly set Content-Type
      }
    );
  }

  UpdateVehicle(vehicleData: any): Observable<any> {
    const payload = {
      ModelName: vehicleData.updateModelName,
      BrandName: vehicleData.updateBrandName,
      newModelName: vehicleData.newModelName,
      newBrandName: vehicleData.newBrandName,
      icon: vehicleData.icon ? `${vehicleData.icon}` : undefined,  // Make sure this is correct
    };

    console.log(payload);

    return this.http.put<any>(
      `http://localhost:7000/api/VehicleModelAndBrand/update/vehicle`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' } // Explicitly set Content-Type
      }
    );
  }

  DeleteVehicle(id: number): Observable<any> {
    return this.http.delete<any>(`http://localhost:7000/api/VehicleModelAndBrand/deleteModel/${id}`);
  }

  DeleteBrand(id: number): Observable<any> {
    return this.http.delete<any>(`http://localhost:7000/api/VehicleModelAndBrand/deleteBrand/${id}`);
  }

  LoadVehiclesWithFilters(params: any): Observable<VehiclesDto[]> {
    const queryParams = new URLSearchParams(params).toString();
    return this.http.get<VehiclesDto[]>(`http://localhost:7000/api/VehicleModelAndBrand/getModel/all?${queryParams}`);
  }

  GetVehiclesByUser(userId:any){
    return this.http.get<VehicleDto[]>(`http://localhost:7000/api/Vehicle/getByUser/${userId}`);
  }
}
