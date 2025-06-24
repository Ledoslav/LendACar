import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { MyConfig } from '../my-config';


export interface SecurityQuestion {
  id: number;
  questionText: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityQuestionService {

  constructor() { }

  private http=inject(HttpClient);
  private baseUrl = MyConfig.api_address + 'SecurityQuestion';

  GetAllQuestions(){
    return this.http.get<SecurityQuestion[]>(this.baseUrl+'/get-all-questions');
  }

  CreateSecurityQuestion(model:any){
    return this.http.post(this.baseUrl+'/create-securityQuestion',model)
  }

  UpdateSecurityQuestion(model:any){
    return this.http.put(this.baseUrl+`/update-securityQuestion/${model.id}`,model)
  }

  DeleteSecurityQuestion(id:any){
    return this.http.delete(this.baseUrl+`/delete-securityQuestion/${id}`)
  }

}
