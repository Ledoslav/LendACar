import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyConfig} from '../my-config';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private base = MyConfig.api_address + '/api/chat'; // use the configured base URL

  constructor(private http: HttpClient) {}

  getUserChats(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}?userId=${userId}`);
  }

  getMessages(chatId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${chatId}/messages`);
  }

  startChat(
    dealerId: number,
    customerId: number,
    dealerName: string,
    vehicle: string,
    vehicleId: number,
    dealerAvatar: string,
    customerName: string,
    customerAvatar: string
  ) {
    return this.http.post<any>(`${this.base}/start`, {
      DealerId: dealerId,
      CustomerId: customerId,
      DealerName: dealerName,
      DealerAvatar: dealerAvatar,
      Vehicle: vehicle,
      VehicleId: vehicleId,
      CustomerName: customerName,
      CustomerAvatar: customerAvatar,
    });
  }

  sendMessage(chatId: number, senderId: number, text: string) {
    return this.http.post<any>(`${this.base}/send`, {
      ChatId: chatId,
      SenderId: senderId,
      Text: text,
    });
  }

  deleteChat(chatId: number) {
    return this.http.delete(`${MyConfig.api_address}/api/chat/${chatId}`);
  }
}
