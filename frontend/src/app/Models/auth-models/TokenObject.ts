import {TokenClaims} from './TokenClaims';

export interface TokenObject{
  token:string;
  claims:TokenClaims|null;
}
