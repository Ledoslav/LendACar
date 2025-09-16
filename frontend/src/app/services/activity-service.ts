import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyConfig} from '../my-config';

export interface Activity {
  id: number;
  userId: number;
  variant: number;
  description: string;
  dateOfActivity: string;
}

export interface ActivityCreateRequest {
  userId: number;
  variant: number;
  companyEmployeeId: number;
  vehicleId: number;
  newVehicleId?: number;  // make optional if sometimes empty
}


@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private baseUrl = MyConfig.api_address; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  /** Get activities for a specific user */
  getAll(userId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}Activity?userId=${userId}`);
  }

  /** Create a new activity */
  create(request: ActivityCreateRequest): Observable<Activity> {
    return this.http.post<Activity>(`${this.baseUrl}Activity`, request);
  }

  /** Delete all activities */
  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}Activity`);
  }
}
