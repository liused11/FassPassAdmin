import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';




@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [CommonModule, TableModule, AvatarModule, TagModule, ],
  templateUrl: './inboxlist.component.html',
  styleUrls: ['./inboxlist.component.css']
})
export class InboxListComponent {

 messages = [
    { subject: 'Meeting Reminder', sender: 'Alice', date: '2025-08-14', status: 'Unread' },
    { subject: 'Project Update', sender: 'Bob', date: '2025-08-13', status: 'Read' },
    { subject: 'Invoice #432', sender: 'Charlie', date: '2025-08-12', status: 'Unread' }
  ];

  getSeverity(status: string) {
    switch (status) {
      case 'Unread':
        return 'danger';
      case 'Read':
        return 'success';
      default:
        return 'info';
    }
  }
 }