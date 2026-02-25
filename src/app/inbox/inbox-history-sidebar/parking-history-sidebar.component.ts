// parking-history-sidebar.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ParkingHistoryItem } from '../../models/parking-history.model';

@Component({
  selector: 'app-parking-history-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,

  ],
  templateUrl: './parking-history-sidebar.component.html',
  styleUrls: ['./parking-history-sidebar.component.css']
})
export class ParkingHistorySidebarComponent {

  @Input() visible = false;
  @Input() loading = false;
  @Input() parkingName = '';
  @Input() history: ParkingHistoryItem[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() loadMore = new EventEmitter<void>(); // 🔥 สำคัญ

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  formatDate(date: string): string {
    const d = new Date(date);

    return `เมื่อ ${d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}, ${d.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })} น.`;
  }
  getTitle(item: ParkingHistoryItem): string {

    if (item.field === 'status') {
      return `เปลี่ยนสถานะจาก ${item.oldValue} เป็น ${item.newValue}`;
    }

    if (item.field === 'price_value') {
      return `เปลี่ยนราคาจาก ${item.oldValue} เป็น ${item.newValue} บาท`;
    }

    if (item.field === 'open_time') {
      return `เปลี่ยนเวลาเปิดจาก ${item.oldValue} เป็น ${item.newValue}`;
    }

    return item.action;
  }

  getIcon(item: ParkingHistoryItem): string {
    if (item.field === 'status') return 'pi pi-car';
    if (item.field === 'price_value') return 'pi pi-wallet';
    if (item.field === 'open_time') return 'pi pi-clock';
    return 'pi pi-pencil';
  }

  getColor(item: ParkingHistoryItem): string {
    if (item.field === 'status') return 'blue';
    if (item.logType === 'revision') return 'gray';
    return 'red';
  }

  get sortedHistory(): ParkingHistoryItem[] {
    return [...this.history].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );
  }
}