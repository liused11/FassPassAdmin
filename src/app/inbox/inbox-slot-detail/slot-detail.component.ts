import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingService } from '../../service/inbox-parking.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { SlotStatus } from '../../models/slot-status.model';

interface Slot {
  id: string;
  name: string;
  status: SlotStatus;
}

interface TimeSlot {
  time: string;
  status: SlotStatus;
}

@Component({
  selector: 'app-slot-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slot-detail.component.html',
  styleUrls: ['./slot-detail.component.css']
})
export class SlotDetailComponent {

  @Input() slots: Slot[] = [];
  @Input() token?: string;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<SlotStatus>();

  constructor(private parkingService: ParkingService) {}

  editMode: 'main' | 'time' = 'main';

  isUpdating = false;

  selectedMainStatus: SlotStatus = 'available';
  originalMainStatus: SlotStatus | null = null;

  slotImageUrl?: string;
  slotName?: string;

  timeSlots: TimeSlot[] = [];

  selectedDate?: string;
  private lastLoadedDate?: string;

  availableDates: {
    label: string;
    date: string;
    weekday: string;
  }[] = [];

  rangeStartIndex: number | null = null;
  rangeEndIndex: number | null = null;

  allowedMinIndex: number | null = null;
  allowedMaxIndex: number | null = null;

  pendingStatus: SlotStatus = 'available';

  ngOnInit() {
    this.generateAvailableDates();
  }

  ngOnChanges() {

    if (this.slots.length && this.originalMainStatus === null) {
      this.originalMainStatus = this.slots[0].status;
      this.selectedMainStatus = this.slots[0].status;
    }

    if (!this.selectedDate) {
      this.selectedDate = this.formatLocalDate(new Date());
      this.loadSchedule();
    }
  }

  loadSchedule() {

    if (!this.token || !this.selectedDate || !this.slots.length) return;
    if (this.lastLoadedDate === this.selectedDate) return;

    this.lastLoadedDate = this.selectedDate;

    const slotId = this.slots[0].id;

    this.parkingService
      .getSlotSchedule(slotId, this.selectedDate, this.token)
      .subscribe({
        next: (res) => {

          this.timeSlots = res.data.time_slots.map((t: any) => ({
            time: t.time.replace('-', ' - '),
            status: t.status
          }));

          this.cancelRange();
        },
        error: (err) => {
          console.error('Load schedule failed', err);
        }
      });
  }

  generateAvailableDates() {

    const today = new Date();
    this.availableDates = [];

    for (let i = 0; i < 5; i++) {

      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = this.formatLocalDate(d);

      this.availableDates.push({
        label: d.getDate().toString(),
        date: dateStr,
        weekday: d.toLocaleDateString('th-TH', { weekday: 'long' })
      });
    }

    this.selectedDate = this.availableDates[0].date;
    this.loadSchedule();
  }

  private formatLocalDate(date: Date): string {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.loadSchedule();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.jpg';
  }

  isPastTimeSlot(slot: TimeSlot): boolean {

    if (!this.selectedDate) return false;

    const now = new Date();
    const selected = new Date(this.selectedDate);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());

    if (selectedDay < today) return true;
    if (selectedDay > today) return false;

    const endTime = slot.time.split(' - ')[1];
    const [hour, minute] = endTime.split(':').map(Number);

    const slotEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute
    );

    return slotEnd <= now;
  }

  isUnclickable(slot: TimeSlot): boolean {
    return slot.status === 'reserved' || this.isPastTimeSlot(slot);
  }

  private calculateContiguousRange(startIndex: number) {

    const baseStatus = this.timeSlots[startIndex].status;

    let min = startIndex;
    let max = startIndex;

    for (let i = startIndex - 1; i >= 0; i--) {

      const slot = this.timeSlots[i];

      if (
        slot.status !== baseStatus ||
        slot.status === 'reserved' ||
        this.isPastTimeSlot(slot)
      ) break;

      min = i;
    }

    for (let i = startIndex + 1; i < this.timeSlots.length; i++) {

      const slot = this.timeSlots[i];

      if (
        slot.status !== baseStatus ||
        slot.status === 'reserved' ||
        this.isPastTimeSlot(slot)
      ) break;

      max = i;
    }

    this.allowedMinIndex = min;
    this.allowedMaxIndex = max;
  }

  onTimeSlotClick(index: number) {

    const slot = this.timeSlots[index];
    if (this.isUnclickable(slot)) return;

    if (this.rangeStartIndex === null) {

      this.rangeStartIndex = index;
      this.rangeEndIndex = null;

      this.calculateContiguousRange(index);
      return;
    }

    if (
      this.allowedMinIndex !== null &&
      this.allowedMaxIndex !== null &&
      index >= this.allowedMinIndex &&
      index <= this.allowedMaxIndex
    ) {
      this.rangeEndIndex = index;
      return;
    }

    this.rangeStartIndex = index;
    this.rangeEndIndex = null;
    this.calculateContiguousRange(index);
  }

  isInRange(index: number): boolean {

    if (this.rangeStartIndex === null) return false;

    if (this.rangeEndIndex === null)
      return index === this.rangeStartIndex;

    const min = Math.min(this.rangeStartIndex, this.rangeEndIndex);
    const max = Math.max(this.rangeStartIndex, this.rangeEndIndex);

    return index >= min && index <= max;
  }

  isOutOfAllowedRange(index: number): boolean {

    if (this.rangeStartIndex === null) return false;
    if (this.allowedMinIndex === null || this.allowedMaxIndex === null) return false;

    return index < this.allowedMinIndex || index > this.allowedMaxIndex;
  }

  get selectedCount(): number {

    if (this.rangeStartIndex === null) return 0;
    if (this.rangeEndIndex === null) return 1;

    return Math.abs(this.rangeEndIndex - this.rangeStartIndex) + 1;
  }

  get selectedRangeLabel(): string {

    if (this.rangeStartIndex === null) return '';

    if (this.rangeEndIndex === null)
      return this.timeSlots[this.rangeStartIndex].time;

    const min = Math.min(this.rangeStartIndex, this.rangeEndIndex);
    const max = Math.max(this.rangeStartIndex, this.rangeEndIndex);

    return `${this.timeSlots[min].time} - ${this.timeSlots[max].time}`;
  }

  get hasPendingChange(): boolean {

    if (!this.slots.length) return false;

    if (this.editMode === 'main')
      return this.selectedMainStatus !== this.slots[0].status;

    if (this.editMode === 'time')
      return this.rangeStartIndex !== null;

    return false;
  }

  cancelRange() {

    this.rangeStartIndex = null;
    this.rangeEndIndex = null;

    this.allowedMinIndex = null;
    this.allowedMaxIndex = null;
  }

  getStatusLabel(status: SlotStatus): string {

    switch (status) {
      case 'available': return 'พร้อมใช้งาน';
      case 'reserved': return 'ถูกจอง';
      case 'maintenance': return 'ปิดปรับปรุง';
      default: return status;
    }
  }

  onCancelClick() {

    if (this.editMode === 'main') {
      this.selectedMainStatus = this.slots[0]?.status;
      return;
    }

    this.cancelRange();
  }

  updateStatus() {

    if (!this.token || this.isUpdating || !this.hasPendingChange) return;

    this.isUpdating = true;

    if (this.editMode === 'main') {

      const slotIds = this.slots.map(s => s.id);

      this.parkingService
        .updateSlotStatus(slotIds, this.selectedMainStatus, this.token)
        .pipe(finalize(() => this.isUpdating = false))
        .subscribe({
          next: () => {

            this.slots.forEach(s => s.status = this.selectedMainStatus);

            this.originalMainStatus = this.selectedMainStatus;
            this.updated.emit(this.selectedMainStatus);
          },
          error: (err) => {
            console.error("MAIN UPDATE ERROR", err);
          }
        });

      return;
    }

    const slotId = this.slots[0].id;

    const min = this.rangeEndIndex === null
      ? this.rangeStartIndex!
      : Math.min(this.rangeStartIndex!, this.rangeEndIndex);

    const max = this.rangeEndIndex === null
      ? this.rangeStartIndex!
      : Math.max(this.rangeStartIndex!, this.rangeEndIndex);

    const startTime = this.timeSlots[min].time.split(' - ')[0];
    const endTime = this.timeSlots[max].time.split(' - ')[1];

    const payload = {
      slot_id: slotId,
      mode: 'single',
      date: this.selectedDate,
      time_ranges: [
        {
          start_time: startTime,
          end_time: endTime,
          status: this.pendingStatus
        }
      ]
    };

    this.parkingService
      .upsertSlotOverride(payload, this.token)
      .pipe(finalize(() => this.isUpdating = false))
      .subscribe({
        next: () => {

          this.lastLoadedDate = undefined;
          this.loadSchedule();

          this.cancelRange();
        },
        error: (err) => {
          console.error('Update time slot failed', err);
        }
      });
  }

  onClose() {
    this.close.emit();
  }

  debugStatus() {
    console.log("selectedMainStatus:", this.selectedMainStatus);
    console.log("slotStatus:", this.slots[0]?.status);
  }
}