import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';


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
  baseUrl:string="http://localhost:7000/api/";

  GetAllQuestions(){
    return this.http.get<SecurityQuestion[]>(this.baseUrl+'SecurityQuestion/get-all-questions');
  }

  CreateSecurityQuestion(model:any){
    return this.http.post(this.baseUrl+'SecurityQuestion/create-securityQuestion',model)
  }

  UpdateSecurityQuestion(model:any){
    return this.http.put(this.baseUrl+`SecurityQuestion/update-securityQuestion/${model.id}`,model)
  }

  DeleteSecurityQuestion(id:any){
    return this.http.delete(this.baseUrl+`SecurityQuestion/delete-securityQuestion/${id}`)
  }

}
