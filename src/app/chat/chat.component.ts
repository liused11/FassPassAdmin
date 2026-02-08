import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, ChatUser, ChatMessage } from '../service/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
    FormsModule,
    AvatarGroupModule,
    BadgeModule,
    OverlayBadgeModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  users: ChatUser[] = [];
  newMessage: string = '';
  selectedUser: ChatUser | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService
  ) {
    this.users = this.chatService.getUsers();

    this.route.queryParams.subscribe(params => {
      const userId = +params['userId'];
      if (userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          this.selectedUser = user;
        }
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser) {
      this.chatService.addMessage({
        userId: this.selectedUser.id,
        sender: 'You',
        avatar: 'https://i.pravatar.cc/40?img=4',
        content: this.newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        own: true
      });
      this.newMessage = '';
    }
  }

  selectUser(user: ChatUser) {
    this.selectedUser = user;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: user.id },
      queryParamsHandling: 'merge'
    });
  }

  get filteredMessages(): ChatMessage[] {
    if (!this.selectedUser) return [];
    return this.chatService.getMessagesForUser(this.selectedUser.id);
  }
}
