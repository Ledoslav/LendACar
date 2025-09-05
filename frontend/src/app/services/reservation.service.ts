import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationCreateDto, ReservationDto, ReservationStatus } from '../Models/ReservationDto';
import { MyConfig } from '../my-config';


@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private baseUrl = MyConfig.api_address + 'reservation';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<ReservationDto> {
    return this.http.get<ReservationDto>(`${this.baseUrl}/getById/${id}`);
  }

  getByOwner(ownerId: number): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.baseUrl}/getByOwner/${ownerId}`);
  }

  getByRenter(renterId: number): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.baseUrl}/getByRenter/${renterId}`);
  }

  create(reservation: ReservationCreateDto): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.baseUrl}/create`, reservation);
  }

  updateStatus(id: number, status: ReservationStatus): Observable<ReservationDto> {
    return this.http.put<ReservationDto>(`${this.baseUrl}/updateStatus/${id}`, { status });
  }
}
