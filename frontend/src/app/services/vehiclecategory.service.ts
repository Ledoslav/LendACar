import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

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

  private apiUrl = 'http://localhost:7000/api/VehicleCategory'; 

  constructor(private http: HttpClient) {}
  
  getCategories()  {
    return this.http.get<VehicleCategoryResponse[]>(`${this.apiUrl}/get`);
  }

}
