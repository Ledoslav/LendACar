import {City} from './City';

export interface UserDto {
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
}
