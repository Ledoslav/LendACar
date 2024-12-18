import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { VerificationRequestDto } from '../Models/VerificationRequestDto';
import { VerificationRequestSubmitDto } from '../Models/VerificationRequestSubmitDto';

@Injectable({
  providedIn: 'root'
})
export class VerificationRequestService {

  constructor() { }
  private http=inject(HttpClient);
  baseUrl:string="http://localhost:7000/api/";

  GetVerificationRequests(){
    return this.http.get<VerificationRequestDto[]>(this.baseUrl + 'VerificationRequest/get')
  }

  GetVerificationRequestById(id:number){
    return this.http.get<VerificationRequestDto>(this.baseUrl + `VerificationRequest/getById/${id}`)
  }

  GetVerificationRequestByUserId(id:number){
    return this.http.get<VerificationRequestDto>(this.baseUrl + `VerificationRequest/getByUserId/${id}`)
  }

  AddVerificationRequest(model:VerificationRequestSubmitDto){
    return this.http.post(this.baseUrl+'VerificationRequest/addNew',model);
  }

  ConfirmVerificationRequest(model:VerificationRequestDto ,id:number){
    return this.http.put(this.baseUrl+`VerificationRequest/approve/${id}`, model);
  }

  DenyVerificationRequest(model:VerificationRequestDto ,id:number){
    return this.http.put(this.baseUrl+`VerificationRequest/deny/${id}`, model);
  }

  DeleteVerificationRequest(id:number){
    return this.http.delete(this.baseUrl+`VerificationRequest/remove/${id}`);
  }
}
