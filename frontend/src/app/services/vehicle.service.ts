import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VehiclesDto} from '../Models/VehiclesDto';
import { VehicleBrandDto } from '../Models/VehicleBrandDto';
import {VehicleDto} from '../Models/VehicleDto';
import { MyConfig } from '../my-config';


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
