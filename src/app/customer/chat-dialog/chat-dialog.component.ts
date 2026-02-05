import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChatService, ChatMessage } from '../../service/chat.service';
import { ModalService } from '../../service/modal.service';

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarModule, ButtonModule, InputTextModule],
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css']
})
export class ChatDialogComponent {
  userId!: number;
  name!: string;
  avatar!: string;
  newMessage: string = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private chatService: ChatService,
    private modalService: ModalService
  ) {
    this.userId = config.data.userId;
    this.name = config.data.name;
    this.avatar = config.data.avatar;
  }

  // ✅ Get all messages for this user
  get messages(): ChatMessage[] {
    return this.chatService.getMessagesForUser(this.userId);
  }

  // ✅ Send a new message
  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.chatService.addMessage({
      userId: this.userId,
      sender: 'Me',
      avatar: 'https://i.pravatar.cc/40?img=4',
      content: this.newMessage,
      time: new Date().toLocaleTimeString(),
      own: true
    });

    this.newMessage = '';
  }

  // ✅ Close current chat modal
  closeDialog() {
    this.modalService.closeModal('chatmodal', this.userId);
  }

  // ✅ Open another chat modal (stacked)
  openAnotherChat(id: number) {
    this.modalService.addModal('chatmodal', id);
  }

  // ✅ Open user info modal from chat
  openUserInfo() {
    this.modalService.addModal('userinfo', this.userId);
  }
}
