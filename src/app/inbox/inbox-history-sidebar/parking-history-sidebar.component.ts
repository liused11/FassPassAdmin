// parking-history-sidebar.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ParkingHistoryItem } from '../../models/parking-history-sidebar.model';

@Component({
  selector: 'app-parking-history-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    ButtonModule,
    DividerModule,
    SkeletonModule
  ],
  templateUrl: './parking-history-sidebar.component.html',
  styleUrls: ['./parking-history-sidebar.component.css']
})
export class ParkingHistorySidebarComponent {

  @Input() visible: boolean = false;
  @Input() loading = false;
  @Input() history: ParkingHistoryItem[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}