export interface UserFilter {
  name?: string | null;
  ageFrom?:number | null;
  ageTo?:number | null;
  cityId?:number | null;
  countryId?:number | null;
  isVerified?:string | null;
}
