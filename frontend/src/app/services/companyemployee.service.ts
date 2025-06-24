import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import { MyConfig } from '../my-config';

// Define the interface for the Employee data
interface Employee {
  userId: number;
  companyAdminEmail: string;
  companyPositionId: number;
  workingHourId: number;
  companyId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyEmployeeService {
  private baseUrl = MyConfig.api_address + 'CompanyEmployee';

  constructor(private http: HttpClient) {}

  // POST method to add an employee
  addEmployee(employee: {
    firstName: string;
    lastName: string;
    companyAdminEmail: any;
    phoneNumber: string;
    title: string;
    email: string
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add`, employee);
  }

  getCompanyAdminEmail(userId: number): Observable<string | null> {
    return this.http.get<{ companyAdminEmail: string | null }>(
      `${this.baseUrl}/admin-email/${userId}`
    ).pipe(
      map((response) => response.companyAdminEmail || null),
      catchError((error) => {
        console.error('Error fetching admin email:', error);
        return of(null);  // Return null if an error occurs
      })
    );
  }

  getAllEmployeesForAdmin(): Observable<any> {
    // Get the current user object from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}'); // Parse the object stored in localStorage

    // Check if emailAddress is available in the parsed object
    const emailAddress = user.emailAddress;

    // Check if emailAddress is available, if not, throw an error
    if (!emailAddress) {
      return throwError('Email address is not available.');
    }

    // Pass the email address as a header to the API
    return this.http.get<any>(`${this.baseUrl}/get/all`, {
      headers: {
        'EmailAddress': emailAddress,  // Send emailAddress in the headers
      },
    });
  }

  getEmployeeForAdmin(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/get/${userId}`)
  }

  deleteEmployee(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${userId}`);
  }

  updateEmployee(employee: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateEmployee`, employee);
  }

}
