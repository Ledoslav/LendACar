import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {City} from '../Models/City';
import {Observable} from 'rxjs';
import {Country} from '../Models/Country';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor() { }
  private http=inject(HttpClient);
  baseUrl:string="http://localhost:7000/api/";

  GetAllCities(){
    return this.http.get<City[]>(this.baseUrl + 'city/get')
  }
  AddCity(model:City){
    return this.http.post(this.baseUrl+'city/add',model);
  }

  RemoveCity(id:number){
    return this.http.delete(this.baseUrl+`city/remove/${id}`);
  }

  UpdateCity(model:City,id:number){
    return this.http.put(this.baseUrl+`city/update/${id}`,model);
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

    return this.http.get<Country[]>(this.baseUrl + 'city/getAllPaged',{observe:'response',params});
  }

}
