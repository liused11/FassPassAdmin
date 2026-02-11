import { Injectable } from '@angular/core';

export interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface ChatMessage {
  userId: number;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  own?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  users: ChatUser[] = [
    { id: 1, name: 'Cody Fisher', avatar: 'https://i.pravatar.cc/40?img=1', lastMessage: "Hey there! I've heard about...", time: '12:30', unread: 8, online: true },
    { id: 2, name: 'PrimeTek Team', avatar: 'https://i.pravatar.cc/40?img=2', lastMessage: "Let's implement PrimeNG...", time: '11:15', unread: 0, online: true },
    { id: 3, name: 'Jerome Bell', avatar: 'https://i.pravatar.cc/40?img=3', lastMessage: "Absolutely! PrimeNG's...", time: '11:15', unread: 6, online: true },
    { id: 4, name: 'Courtney Henry', avatar: 'https://i.pravatar.cc/40?img=4', lastMessage: "Any updates on the project?", time: '10:45', unread: 2, online: false },
    { id: 5, name: 'Arlene McCoy', avatar: 'https://i.pravatar.cc/40?img=5', lastMessage: "Thanks for the quick response!", time: '09:30', unread: 0, online: true },
    { id: 6, name: 'Jacob Jones', avatar: 'https://i.pravatar.cc/40?img=6', lastMessage: "Let's catch up tomorrow.", time: '08:20', unread: 4, online: true },
    { id: 7, name: 'Esther Howard', avatar: 'https://i.pravatar.cc/40?img=7', lastMessage: "I’ll review the document tonight.", time: '07:50', unread: 1, online: false },
    { id: 8, name: 'Jenny Wilson', avatar: 'https://i.pravatar.cc/40?img=8', lastMessage: "Perfect! That works for me.", time: '07:15', unread: 0, online: true }
  ];

  private messages: ChatMessage[] = [
    { userId: 1, sender: 'Cody Fisher', avatar: 'https://i.pravatar.cc/40?img=1', content: "Awesome! What's the standout feature?", time: '11:15' },
    { userId: 2, sender: 'PrimeTek Team', avatar: 'https://i.pravatar.cc/40?img=2', content: "PrimeNG rocks! Simplifies UI dev with versatile components.", time: '11:16', own: true },
    { userId: 1, sender: 'Cody Fisher', avatar: 'https://i.pravatar.cc/40?img=1', content: "Intriguing! Tell us more about its impact.", time: '11:17' },
    { userId: 4, sender: 'Courtney Henry', avatar: 'https://i.pravatar.cc/40?img=4', content: "Hey, are we still on schedule?", time: '10:46' },
    { userId: 5, sender: 'Arlene McCoy', avatar: 'https://i.pravatar.cc/40?img=5', content: "That’s awesome news, thank you!", time: '09:35' },
    { userId: 6, sender: 'Jacob Jones', avatar: 'https://i.pravatar.cc/40?img=6', content: "Can we postpone our call?", time: '08:25' },
    { userId: 7, sender: 'Esther Howard', avatar: 'https://i.pravatar.cc/40?img=7', content: "I’ll send the draft later tonight.", time: '07:55' },
    { userId: 8, sender: 'Jenny Wilson', avatar: 'https://i.pravatar.cc/40?img=8', content: "Great, let’s finalize it then!", time: '07:20' }
  ];

  getUsers() {
    return this.users;
  }

  getMessagesForUser(userId: number) {
    return this.messages.filter(m => m.userId === userId);
  }

  addMessage(message: ChatMessage) {
    this.messages.push(message);
  }
}