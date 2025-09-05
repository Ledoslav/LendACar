import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  mode: string = 'light-mode';

  chats: Chat[] = [
    {
      id: 1,
      name: 'Sparkwave',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV73LLJOiHX0CsbBKLfTn0z4u9R8_Fv1FGtg&s',
      lastMessage: 'Izvinjavamo se...',
      time: '10:30 AM',
      vehicle: 'Audi A4 2020',
      messages: [
        { text: 'Ako je moguće samo da sjedišta budu čista, prošli put kada sam uzimao je bilo baš prljavo?', sender: 'me' },
        { text: 'Izvinjavamo se zbog toga, naravno. Lp', sender: 'them' }
      ]
    },
    {
      id: 2,
      name: 'LedoSlav',
      avatar: 'https://i.ytimg.com/vi/yy4JminKGfA/maxresdefault.jpg',
      lastMessage: '',
      time: '',
      vehicle: 'VW Golf 7 2018',
      messages: []
    },
  ];

  selectedChat: Chat | null = null;
  newMessage: string = '';

  ngOnInit() {
    this.mode = localStorage.getItem('mode') || 'light-mode';

    // 👇 Open the second chat by default
    if (this.chats.length > 1) {
      this.selectedChat = this.chats[1];
    }
  }

  selectChat(chat: Chat) {
    this.selectedChat = chat;
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedChat) {
      this.selectedChat.messages.push({
        text: this.newMessage,
        sender: 'me'
      });

      // Update last message
      this.selectedChat.lastMessage = this.newMessage;
      this.selectedChat.time = 'Now';

      this.newMessage = '';
    }
  }
}

interface Message {
  text: string;
  sender: 'me' | 'them';
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  vehicle: string;   // 👈 New field for reserved car
  messages: Message[];
}
