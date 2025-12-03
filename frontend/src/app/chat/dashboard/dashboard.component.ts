import {Component, OnInit, AfterViewInit, inject} from '@angular/core';
import { ChatService } from '../../services/chat-service';
import { ChatApiService } from '../../services/chat-api.service';
import {UserService} from '../../services/user.service';
import {UserDto} from '../../Models/UserDto';
import {delay} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  mode: string = 'light-mode';
  connected = false;

  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  newMessage: string = '';
  user: UserDto | null = null;

  constructor(
    private chatService: ChatService,
    private chatApi: ChatApiService,
    private userService: UserService,
    private router:Router
  ) {}

  ngOnInit(): void {

    this.mode = localStorage.getItem('mode') || 'light-mode';
    this.user = this.userService.getCurrentUser();

    const userId = Number(this.user?.id);

    this.chatApi.getUserChats(userId).subscribe(chats => {
      this.chats = chats.map(c => {

        // Determine who is "other user"
        const isDealer = c.dealerId === userId;

        const otherName = isDealer ? c.customerName : c.dealerName;
        const otherAvatar = isDealer ? c.customerAvatar : c.dealerAvatar;

        return {
          id: c.id,
          name: otherName,
          avatar: otherAvatar ?? "defaultProfilePic.png",
          vehicle: c.vehicle,
          vehicleId: c.vehicleId,
          lastMessage: c.messages?.length
            ? c.messages[c.messages.length - 1].text
            : '',
          time: c.messages?.length
            ? new Date(c.messages[c.messages.length - 1].timestamp).toLocaleTimeString()
            : '',
          messages: c.messages?.map((m: any) => ({
            text: m.text,
            sender: m.senderId === userId ? 'me' : 'them'
          })) ?? []
        };
      });

      if (this.chats.length > 0) this.selectChat(this.chats[0]);
    });

    this.chatService.connect().then(() => {
      this.chatService.onMessageReceived((msg) => {
        const chat = this.chats.find(c => c.id === msg.chatId);
        if (!chat) return;

        // Ignore if we just added this message optimistically
        const alreadyExists = chat.messages.some(
          m => m.text === msg.text && m.sender === 'me'
        );
        if (alreadyExists) return;

        chat.messages.push({
          text: msg.text,
          sender: Number(msg.sender) === this.user?.id ? 'me' : 'them'
        });

        chat.lastMessage = msg.text;
        chat.time = new Date(msg.timestamp).toLocaleTimeString();
      });
    });

    this.chatApi.getUserChats(userId).subscribe(chats => {
      this.chats = chats.map(c => {

        // Determine who is "other user"
        const isDealer = c.dealerId === userId;

        const otherName = isDealer ? c.customerName : c.dealerName;
        const otherAvatar = isDealer ? c.customerAvatar : c.dealerAvatar;

        return {
          id: c.id,
          name: otherName,
          avatar: otherAvatar ?? "defaultProfilePic.png",
          vehicle: c.vehicle,
          vehicleId: c.vehicleId,
          lastMessage: c.messages?.length
            ? c.messages[c.messages.length - 1].text
            : '',
          time: c.messages?.length
            ? new Date(c.messages[c.messages.length - 1].timestamp).toLocaleTimeString()
            : '',
          messages: c.messages?.map((m: any) => ({
            text: m.text,
            sender: m.senderId === userId ? 'me' : 'them'
          })) ?? []
        };
      });

      if (this.chats.length > 0) this.selectChat(this.chats[0]);
    });
  }

  selectChat(chat: Chat) {
    this.selectedChat = chat;

    this.chatApi.getMessages(chat.id).subscribe(msgs => {
      chat.messages = msgs.map((m: any) => ({
        text: m.text,
        sender: m.senderId === this.user?.id ? 'me' : 'them'
      }));

      if (this.chatService.connected) {
        this.chatService.joinChat(chat.id).catch(console.warn);
      }
    });
  }

  RouteToListing(vehicleId:number) {
    this.router.navigate(['/vehicle/listing/' + vehicleId]);
  }

  deleteChat(chat: Chat) {
    if (!confirm(`Delete chat with ${chat.name}?`)) return;

    this.chatApi.deleteChat(chat.id).subscribe({
      next: _ => {
        this.chats = this.chats.filter(c => c.id !== chat.id);

        // If the deleted chat was open — clear UI or open next one
        if (this.selectedChat?.id === chat.id) {
          this.selectedChat = this.chats.length > 0 ? this.chats[0] : null;
        }
      }
    });
  }


  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChat) return;

    const msg = this.newMessage;

    this.chatService.sendMessage(
      this.selectedChat.id,
      Number(this.user?.id),
      msg
    ).catch(console.error);

    // Optimistic UI
    this.selectedChat.messages.push({
      text: msg,
      sender: 'me'
    });

    this.selectedChat.lastMessage = msg;
    this.selectedChat.time = new Date().toLocaleTimeString();
    this.newMessage = '';
  }
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  vehicle: string;
  vehicleId: number;
  messages: Message[];
}

interface Message {
  text: string;
  sender: 'me' | 'them';
}
