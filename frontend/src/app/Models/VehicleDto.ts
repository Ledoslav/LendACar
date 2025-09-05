export interface VehicleDto {
  id: number;
  title: string;
  engineDisplacement: number;
  enginePower: number;
  transmissionType: number; // 0 - Manual, 1 - Automatic, 2 - AutomatedManual, 3 - DCT, 4 - CVT
  fuelType: number; // 0 - Petrol , 1 - Diesel, 2 - Electric, 3 - Hybrid, 4 - LPG, 5 - CNG
  airConditioning: number; // 0 - None, 1 - Single-Zone, 2 - Double-Zone, 3 - Triple-Zone, 4 - Quad-Zone
  numberOfSeats: number;
  towingHitch: boolean;
  description: string;
  productionYear: number;
  avaliable: boolean;
  averageRating: number;
  pricePerDay: number;
  vehicleCategoryID: number;
  vehicleCategory: any; // You can refine this type
  vehicleModelID: number;
  vehicleModel: VehicleModel; // You can refine this type
  userID: number;
  user: any; // You can refine this type
  cityID: number;
  city: any; // You can refine this type
  lastUpdated: string;
}

export interface VehicleModel{
  id: number;
  modelName: string;
  vehicleBrand: VehicleBrand;
}

export interface VehicleBrand{
  id: number;
  brandName: string;
}

export interface VehicleWithImagesDto {
  id: number;
  title: string;
  engineDisplacement: number;
  enginePower: number;
  transmissionType: number; // 0 - Manual, 1 - Automatic, 2 - AutomatedManual, 3 - DCT, 4 - CVT
  fuelType: number; // 0 - Petrol , 1 - Diesel, 2 - Electric, 3 - Hybrid, 4 - LPG, 5 - CNG
  airConditioning: number; // 0 - None, 1 - Single-Zone, 2 - Double-Zone, 3 - Triple-Zone, 4 - Quad-Zone
  numberOfSeats: number;
  towingHitch: boolean;
  description: string;
  productionYear: number;
  avaliable: boolean;
  averageRating: number;
  pricePerDay: number;
  vehicleCategoryID: number;
  vehicleCategory: any; // You can refine this type
  vehicleModelID: number;
  vehicleModel: any; // You can refine this type
  userID: number;
  user: any; // You can refine this type
  cityID: number;
  city: any; // You can refine this type
  lastUpdated: string;
  vehicleImages: VehicleImageDto[];
}


export interface VehicleImageDto {
  id: number;
  imageUrl: string;
  publicId?: string; // optional, in case you need it
}