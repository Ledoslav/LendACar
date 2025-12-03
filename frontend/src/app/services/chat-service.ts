import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

export interface ChatMessage {
  chatId: number;
  sender: string;
  text: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private hub!: signalR.HubConnection;
  private url = 'http://localhost:7000/chatHub'; // hub endpoint
  connected = false;

  connect(): Promise<void> {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(this.url)
      .withAutomaticReconnect()
      .build();

    this.hub.onclose(() => {
      this.connected = false;
      console.warn('SignalR disconnected');
    });

    return this.hub.start().then(() => {
      this.connected = true;
      console.log('SignalR connected');
    });
  }

  joinChat(chatId: number) {
    if (!this.hub) return Promise.reject('Not connected');
    return this.hub.invoke('JoinChat', chatId);
  }

  sendMessage(chatId: number, senderId: number, text: string) {
    if (!this.hub) return Promise.reject('Not connected');
    return this.hub.invoke('SendMessage', chatId, senderId, text);
  }

  onMessageReceived(cb: (msg: ChatMessage) => void) {
    if (!this.hub) return;
    this.hub.on('ReceiveMessage', cb);
  }

}
