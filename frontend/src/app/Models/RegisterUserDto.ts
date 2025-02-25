import {SecurityQuestion} from '../services/security-question.service';

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  cityId:number
  emailAdress: string;
  username: string;
  password: string;
  workingHourId:number;
  securityQuestionId?: number;
  securityQuestion?: SecurityQuestion;
  questionAnswer?: string;
}
