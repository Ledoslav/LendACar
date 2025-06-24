import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { MyConfig } from '../my-config';

export interface VehicleCategoryResponse {
  id?: number;
  name: string;
  description: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleCategoriesService{

  private baseUrl = MyConfig.api_address + 'vehiclecategory';

  constructor(private http: HttpClient) {}
  
  getCategories()  {
    return this.http.get<VehicleCategoryResponse[]>(`${this.baseUrl}/get`);
  }

}
