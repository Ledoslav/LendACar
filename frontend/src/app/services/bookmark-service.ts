import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../my-config';

export interface Bookmark {
  id: number;
  userId: number;
  vehicleId: number;
  dateCreated: string;
}

export interface BookmarkRequest {
  userId: number;
  vehicleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private baseUrl = MyConfig.api_address + 'Bookmark'; // adjust as needed

  constructor(private http: HttpClient) {}

  /** Get all bookmarks for a specific user */
  getBookmarks(userId: number): Observable<Bookmark[]> {
    return this.http.get<Bookmark[]>(`${this.baseUrl}?userId=${userId}`);
  }

  /** Toggle a bookmark */
  toggleBookmark(userId: number, vehicleId: number): Observable<void> {
    const request: BookmarkRequest = { userId, vehicleId };
    return this.http.post<void>(this.baseUrl, request);
  }
}
