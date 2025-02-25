import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserSecurityQuestionAnswerDto} from '../Models/UserSecurityQuestionAnswerDto';
import {SecurityQuestion} from './security-question.service';


export interface ChangeSecurityQuestionRequest {
  securityQuestionId: number;
  securityQuestion?: SecurityQuestion;
  questionAnswer: string;
  currentPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserSecurityQuestionAnswerService {

  constructor() { }

  private http=inject(HttpClient);
  baseUrl:string="http://localhost:7000/api/";

  HasUserQuestion(email:string){
    return this.http.get<{ hasSecurityQuestion:boolean, questionText:number }>(this.baseUrl+`UserSecurityQuestionAnswer/user-security/${email}`);
  }

  SubmitAnswer(email:string,model:UserSecurityQuestionAnswerDto){
    return this.http.post<{isAnswerGood:boolean}>(this.baseUrl+`UserSecurityQuestionAnswer/submit-answer/${email}`,model);
  }

  CreateAnswer(userId:number,model:any){
    return this.http.post(this.baseUrl+`UserSecurityQuestionAnswer/create-answer/${userId}`,model);
  }

  ChangeSecurityQuestion(userId:number,model:any){
    return this.http.put(this.baseUrl+`UserSecurityQuestionAnswer/change-question/${userId}`,model);
  }

  RemoveSecurityQuestion(userId:number,model:any){
    return this.http.delete(this.baseUrl+`UserSecurityQuestionAnswer/remove-securityQuestion/${userId}`, {body:model});
  }
}
