import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MyConfig} from '../my-config';

export interface VehicleOverviewPagingRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  ownerId?: number;
  brandId?: number;
  cityId?: number;
  categoryId?: number;
  fuelType?: number;
  sortOrder?: string;
}

export interface VehicleOverviewDto {
  id: number;
  title: string;
  ownerName: string;
  brandName: string;
  cityName: string;
  categoryName: string;
  fuelType: number;
  pricePerDay: number;
  reservationsCount: number;
}

export interface FilterOptionDto {
  id: number;
  name: string;
}

export interface VehicleOverviewFilterOptionsDto {
  owners: FilterOptionDto[];
  brands: FilterOptionDto[];
  cities: FilterOptionDto[];
  categories: FilterOptionDto[];
}

@Injectable({
  providedIn: 'root'
})
export class VehicleOverviewService {
  private http = inject(HttpClient);
  private baseUrl = MyConfig.api_address + 'VehicleOverview/';

  getPagedVehicles(request: VehicleOverviewPagingRequest): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', request.pageNumber)
      .set('PageSize', request.pageSize);

    if (request.search) params = params.set('Search', request.search);
    if (request.ownerId) params = params.set('OwnerId', request.ownerId);
    if (request.brandId) params = params.set('BrandId', request.brandId);
    if (request.cityId) params = params.set('CityId', request.cityId);
    if (request.categoryId) params = params.set('CategoryId', request.categoryId);
    if (request.fuelType !== undefined && request.fuelType !== null) params = params.set('FuelType', request.fuelType);
    if (request.sortOrder) params = params.set('SortOrder', request.sortOrder);

    return this.http.get<any>(this.baseUrl + 'paged', { params });
  }

  getFilterOptions(): Observable<VehicleOverviewFilterOptionsDto> {
    return this.http.get<VehicleOverviewFilterOptionsDto>(this.baseUrl + 'filter-options');
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl + 'delete/' + id);
  }
}
