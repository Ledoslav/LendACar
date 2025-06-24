import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private baseUrl = MyConfig.api_address + 'company';

  constructor(private http: HttpClient) {}

  // Check if a company exists for the user
  checkIfCompanyExists(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check/${userId}`);
  }

  // Get company details if needed
  getCompanyByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/get/${userId}`);
  }

// API call to create a company
  createCompany(companyData: any): Observable<any> {
    const formData = new FormData();

    // Append text fields
    formData.append('companyName', companyData.companyName);
    formData.append('companyPhone', companyData.companyPhone);
    formData.append('companyDescription', companyData.companyDescription);
    formData.append('companyEmail', companyData.companyEmail);
    formData.append('companyAddress', companyData.address);
    formData.append('userId', companyData.userId.toString());

    // Append the avatar image if it's provided
    if (companyData.companyAvatar) {
      formData.append('companyAvatar', companyData.avatar, companyData.avatar.name);
    }

    return this.http.post<any>(`${this.baseUrl}/create`, formData);
  }

  deleteCompanyByUserId(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteByUser/${userId}`);
  }

  updateCompanyByUserId(userId: number, companyData: any): Observable<void> {
    const formData = new FormData();

    // Append text fields
    formData.append('companyName', companyData.companyName);
    formData.append('companyPhone', companyData.companyPhone);
    formData.append('companyDescription', companyData.companyDescription);
    formData.append('companyEmail', companyData.companyEmail);
    formData.append('companyAddress', companyData.companyAddress);
    formData.append('userId', companyData.userId.toString());

    // Append the avatar image if it's provided
    if (companyData.companyAvatar) {
      formData.append('companyAvatar', companyData.companyAvatar, companyData.companyAvatar.name);
    }

    return this.http.put<void>(`${this.baseUrl}/updateByUser/${userId}`, formData);
  }
}
