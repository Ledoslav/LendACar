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

  checkIfCompanyExists(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check/${userId}`);
  }

  getCompanyByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/get/${userId}`);
  }

  createCompany(companyData: any): Observable<any> {
    const formData = new FormData();

    // Append text fields
    formData.append('companyName', companyData.companyName);
    formData.append('companyPhone', companyData.companyPhone);
    formData.append('companyDescription', companyData.companyDescription);
    formData.append('companyEmail', companyData.companyEmail);
    formData.append('companyAddress', companyData.companyAddress);
    formData.append('userId', companyData.userId);
    formData.append('fileName', companyData.fileName);

    console.log('companyData:', companyData);
    if (companyData.companyAvatar) {
      formData.append('companyAvatar', companyData.companyAvatar, companyData.companyAvatar.name);
    }

    if (companyData.file) {
      formData.append('file', companyData.file, companyData.file.name);
    }

    return this.http.post<any>(`${this.baseUrl}/create`, formData);
  }

  deleteCompanyByUserId(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteByUser/${userId}`);
  }

  updateCompanyByUserId(userId: number, companyData: any): Observable<void> {
    const formData = new FormData();

    formData.append('companyName', companyData.companyName);
    formData.append('companyPhone', companyData.companyPhone);
    formData.append('companyDescription', companyData.companyDescription);
    formData.append('companyEmail', companyData.companyEmail);
    formData.append('companyAddress', companyData.companyAddress);
    formData.append('userId', companyData.userId.toString());
    formData.append('fileName', companyData.fileName);

    if (companyData.companyAvatar) {
      formData.append('companyAvatar', companyData.companyAvatar, companyData.companyAvatar.name);
    }

    if (companyData.file) {
      formData.append('file', companyData.file, companyData.file.name);
    }

    return this.http.put<void>(`${this.baseUrl}/updateByUser/${userId}`, formData);
  }
}
