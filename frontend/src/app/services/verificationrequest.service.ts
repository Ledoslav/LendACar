import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { VerificationRequestDto } from '../Models/VerificationRequestDto';
import { VerificationRequestSubmitDto } from '../Models/VerificationRequestSubmitDto';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class VerificationRequestService {

  constructor() { }
  private http=inject(HttpClient);
  private baseUrl = MyConfig.api_address + 'verificationrequest';

  GetVerificationRequests(){
    return this.http.get<VerificationRequestDto[]>(this.baseUrl + '/get')
  }

  GetFilteredVerificationRequests(status?: number, searchQuery?: string, cityId?: number) {
    let params = new HttpParams();
    if (status !== undefined && status !== null) params = params.set('status', status.toString());
    if (searchQuery) params = params.set('searchQuery', searchQuery);
    if (cityId) params = params.set('cityId', cityId.toString());

    return this.http.get<VerificationRequestDto[]>(this.baseUrl + '/getFiltered', { params });
  }

  GetVerificationRequestById(id:number){
    return this.http.get<VerificationRequestDto>(this.baseUrl + `/getById/${id}`)
  }

  GetVerificationRequestByUserId(id:number){
    return this.http.get<VerificationRequestDto>(this.baseUrl + `/getByUserId/${id}`)
  }

  AddVerificationRequest(model:VerificationRequestSubmitDto){
    return this.http.post(this.baseUrl+'/addNew',model);
  }

  ConfirmVerificationRequest(model:VerificationRequestDto ,id:number){
    return this.http.put(this.baseUrl+`/approve/${id}`, model);
  }

  DenyVerificationRequest(model:VerificationRequestDto ,id:number){
    return this.http.put(this.baseUrl+`/deny/${id}`, model);
  }

  DeleteVerificationRequest(id:number){
    return this.http.delete(this.baseUrl+`/remove/${id}`);
  }
}
