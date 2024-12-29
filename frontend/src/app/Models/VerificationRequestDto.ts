import { EmployeeDto } from './EmployeeDto';
import { UserDto } from './UserDto';

export interface VerificationRequestDto {
  id:number;
  requestDate: string;
  userId: number;
  user: UserDto;
  requestComment: string | null; 
  requestReviewDate: string | null; 
  requestStatus: number; 
  denialComment: string | null; 
  empAdmId: number | null; 
  reviewedByAdmin: boolean | false;
}
