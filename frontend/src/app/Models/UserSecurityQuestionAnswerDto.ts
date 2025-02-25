import {SecurityQuestion} from '../services/security-question.service';

export interface UserSecurityQuestionAnswerDto {
  id?: number;
  securityQuestionId: number;
  securityQuestion?: SecurityQuestion;
  questionAnswer: string;
}
