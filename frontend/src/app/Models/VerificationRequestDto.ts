import { EmployeeDto } from './EmployeeDto';
import { UserDto } from './UserDto';

export interface VerificationRequestDto {
  id:number;
  requestDate: string;
  userId: number;
  user: UserDto;
  requestComment: string | null; 
  requestReviewDate: string | null; 
  isApproved: boolean; 
  denialComment: string | null; 
  employeeId: number | null; 
  employee: EmployeeDto | null; 
}
