import {City} from './City';

export interface AdministratorDto {
  id:number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  cityId: number;
  city: City;
  emailAddress: string;
  username: string;
}
