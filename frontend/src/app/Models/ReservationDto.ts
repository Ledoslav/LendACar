import { City } from "./City";
import { UserDto } from "./UserDto";
import { VehicleWithImagesDto } from "./VehicleDto";

export interface ReservationDto {
  id: number;
  status: ReservationStatus;
  isCashPayment: boolean;
  price: number;
  pickUpDateTime: string;
  dropOffDateTime: string;
  renterId: number;
  renter?: UserDto;
  ownerId: number;
  owner?: UserDto;
  vehicleID: number;
  vehicle?: VehicleWithImagesDto;
  pickUpCityID: number;
  pickUpCity?: City;
  dropOffCityID: number;
  dropOffCity?: City;
}

export interface ReservationCreateDto {
  status: ReservationStatus;
  isCashPayment: boolean;
  price: number;
  pickUpDateTime: string;
  dropOffDateTime: string;
  renterId: number;
  ownerId: number;
  vehicleID: number;
  pickUpCityID: number;
  dropOffCityID: number;
}

export enum ReservationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3,
  Completed = 4
}
