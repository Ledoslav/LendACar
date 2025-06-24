import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {City} from '../Models/City';
import {Observable} from 'rxjs';
import {Country} from '../Models/Country';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor() { }
  private http=inject(HttpClient);
  private baseUrl = MyConfig.api_address + 'city';

  GetAllCities(){
    return this.http.get<City[]>(this.baseUrl + '/get')
  }
  AddCity(model:City){
    return this.http.post(this.baseUrl+'/add',model);
  }

  RemoveCity(id:number){
    return this.http.delete(this.baseUrl+`/remove/${id}`);
  }

  UpdateCity(model:City,id:number){
    return this.http.put(this.baseUrl+`/update/${id}`,model);
  }


  getAllCitiesPaged(cityName:string="",pageNumber?:number,pageSize?:number,countryId:number=0):Observable<HttpResponse<Country[]>>{
    let params=new HttpParams();

    params = params.set('cityName',cityName);
    if(pageNumber && pageSize){
      params = params.set('pageSize',pageSize);
      params=params.set('pageNumber',pageNumber);
    }

    if(countryId)
      params=params.set('countryId',countryId);

    return this.http.get<Country[]>(this.baseUrl + '/getAllPaged',{observe:'response',params});
  }

}
