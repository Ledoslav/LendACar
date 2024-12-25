import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VehicleService{
  private http = inject(HttpClient);
  LoadVehicles(){
    return this.http.get("http://localhost:7000/api/VehicleModelAndBrand/getModel/all");
  }

  AddVehicle(vehicleData: any): Observable<any> {
    const payload = {
      modelName: vehicleData.modelName,
      BrandName: vehicleData.vehicleBrandName, // Use correct field name (case-sensitive)
    };

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
      newBrandName: vehicleData.newBrandName, // Use correct field name (case-sensitive)
    };

    console.log(payload);

    return this.http.put<any>(
      `http://localhost:7000/api/VehicleModelAndBrand/update/vehicle`,
      payload, // Send JSON directly
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
}
