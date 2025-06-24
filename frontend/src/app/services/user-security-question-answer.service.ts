import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserSecurityQuestionAnswerDto} from '../Models/UserSecurityQuestionAnswerDto';
import {SecurityQuestion} from './security-question.service';
import { MyConfig } from '../my-config';


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
  private baseUrl = MyConfig.api_address + 'usersecurityquestionanswer';

  HasUserQuestion(email:string){
    return this.http.get<{ hasSecurityQuestion:boolean, questionText:number }>(this.baseUrl+`/user-security/${email}`);
  }

  SubmitAnswer(email:string,model:UserSecurityQuestionAnswerDto){
    return this.http.post<{isAnswerGood:boolean}>(this.baseUrl+`/submit-answer/${email}`,model);
  }

  CreateAnswer(userId:number,model:any){
    return this.http.post(this.baseUrl+`/create-answer/${userId}`,model);
  }

  ChangeSecurityQuestion(userId:number,model:any){
    return this.http.put(this.baseUrl+`/change-question/${userId}`,model);
  }

  RemoveSecurityQuestion(userId:number,model:any){
    return this.http.delete(this.baseUrl+`/remove-securityQuestion/${userId}`, {body:model});
  }
}
