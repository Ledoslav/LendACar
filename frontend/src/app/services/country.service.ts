import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {Country} from '../Models/Country';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private http=inject(HttpClient)
  baseUrl:string="http://localhost:7000/api/";
  getAllCountries(countryName:string=""):Observable<Country[]>{
    return this.http.get<Country[]>(this.baseUrl + 'country/getAll',{params:{countryName:countryName}});
  }

  getAllCountriesPaged(countryName:string="",pageNumber?:number,pageSize?:number):Observable<HttpResponse<Country[]>>{
    let params=new HttpParams();

    params = params.set('countryName',countryName);
    if(pageNumber && pageSize){
      params = params.set('pageSize',pageSize);
      params=params.set('pageNumber',pageNumber);
    }

    return this.http.get<Country[]>(this.baseUrl + 'country/getAllPaged',{observe:'response',params});
  }

  CreateCountry(model:Country){
    return this.http.post(this.baseUrl+'country/create',model);
  }

  RemoveCountry(id:number){
    return this.http.delete(this.baseUrl+`country/remove/${id}`);
  }

  UpdateCountry(model:Country, id:number){
    return this.http.put(this.baseUrl+`country/update/${id}`,model);
  }
}
