import {City} from '../City';
import {WorkingHour} from '../WorkingHour';

export interface AuthResponse {
  id:number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  cityId: number;
  city: City;
  emailAddress: string;
  username: string;
  averageRating: number;
  isVerified: boolean;
  token: string;
  workingHour:WorkingHour | null,
  workingHourId:number | null,
  jobTitle:string | null,
}
