// slot-detail.component.ts
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

  isUpdating = false;
  selectedMainStatus: SlotStatus = 'available';
  // ===== EDIT MODE =====
  editMode: 'main' | 'time' = 'main';

    // 🟢 mock time slots
  timeSlots: TimeSlot[] = [];
  selectedTimeSlots: TimeSlot[] = [];
  bulkStatus: SlotStatus = 'available';

  // ===== RANGE SELECTOR =====
  rangeStartIndex: number | null = null;
  rangeEndIndex: number | null = null;
  pendingStatus: SlotStatus = 'available';

  // 🟢 mock slot info
  slotImageUrl?: string;
  slotName?: string;

  // ===== SCHEDULE MODE =====
  scheduleMode: 'single' | 'range' | 'weekly' = 'single';

  selectedDate?: string;
  rangeStartDate?: string;
  rangeEndDate?: string;
  selectedWeekday?: number;
  private lastLoadedDate?: string; // เพื่อป้องกันการโหลดซ้ำ

  availableDates: {
    label: string;
    date: string;
    weekday: string;
  }[] = [];

  // contiguous boundary
  allowedMinIndex: number | null = null;
  allowedMaxIndex: number | null = null;
  

  constructor(private parkingService: ParkingService) {}

  ngOnInit() {
    this.generateAvailableDates();
  }

  loadSchedule() {

    

    if (!this.token || !this.selectedDate || !this.slots.length) return;
    if (this.lastLoadedDate === this.selectedDate) return;

    this.lastLoadedDate = this.selectedDate;
    console.log('🔥 Fetching schedule for:', this.selectedDate);
    console.log('UI selectedDate:', this.selectedDate);

    const slotId = this.slots[0].id;

    this.parkingService
      .getSlotSchedule(slotId, this.selectedDate, this.token)
      .subscribe({
        next: (res) => {
          console.log('🔥 Fetching schedule for:', this.selectedDate);

          this.timeSlots = res.data.time_slots.map((t: any) => ({
            time: t.time.replace('-', ' - '),
            status: t.status
          }));

          // reset selection
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

      const weekday = d.toLocaleDateString('th-TH', { weekday: 'long' });

      this.availableDates.push({
        label: d.getDate().toString(),
        date: dateStr,
        weekday
      });
    }

    // default เลือกวันนี้
    this.selectedDate = this.availableDates[0].date;
    this.loadSchedule();
  }
  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.jpg';
  }

  ngOnChanges() {
    if (this.slots.length) {
      this.selectedMainStatus = this.slots[0].status;
      if (!this.selectedDate) {
        const today = new Date();
        this.selectedDate = this.formatLocalDate(today);
        this.loadSchedule();
      }
    }
  }

  

  // ===== RANGE CLICK =====

  selectDate(date: string) {
    this.selectedDate = date;
    this.loadSchedule();
  }
  isPastTimeSlot(slot: TimeSlot): boolean {

    if (!this.selectedDate) return false;

    const now = new Date();
    const selected = new Date(this.selectedDate);

    // เอาเฉพาะวันที่ (ตัดเวลาออก)
    const todayDateOnly = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const selectedDateOnly = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate()
    );

    // ถ้าเป็นวันก่อนหน้า → ทั้งวัน disable
    if (selectedDateOnly < todayDateOnly) return true;

    // ถ้าเป็นวันอนาคต → แก้ได้หมด
    if (selectedDateOnly > todayDateOnly) return false;

    // ===== ตรงนี้คือ "วันนี้" เท่านั้น =====

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
    return (
      slot.status === 'reserved' ||
      this.isPastTimeSlot(slot)
    );
  }

  private calculateContiguousRange(startIndex: number) {

    const baseStatus = this.timeSlots[startIndex].status;

    let min = startIndex;
    let max = startIndex;

    // 🔎 scan left
    for (let i = startIndex - 1; i >= 0; i--) {

      const slot = this.timeSlots[i];

      if (
        slot.status !== baseStatus ||   // 🔥 status ต้องเหมือนกัน
        slot.status === 'reserved' ||   // reserved กันเสมอ
        this.isPastTimeSlot(slot)       // past กันเสมอ
      ) break;

      min = i;
    }

    // 🔎 scan right
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

    // 🔥 ใช้ isUnclickable แทน
    if (this.isUnclickable(slot)) return;


    // ยังไม่มี start → ตั้ง start และคำนวณ boundary
    if (this.rangeStartIndex === null) {
      this.rangeStartIndex = index;
      this.rangeEndIndex = null;

      this.calculateContiguousRange(index);
      return;
    }

    // มี start แล้ว → ต้องอยู่ใน allowed boundary เท่านั้น
    if (
      this.allowedMinIndex !== null &&
      this.allowedMaxIndex !== null &&
      index >= this.allowedMinIndex &&
      index <= this.allowedMaxIndex
    ) {
      this.rangeEndIndex = index;
      return;
    }

    // ถ้ากดนอก boundary → เริ่มใหม่
    this.rangeStartIndex = index;
    this.rangeEndIndex = null;
    this.calculateContiguousRange(index);
  }

  // ===== CHECK SELECTED RANGE =====
  isInRange(index: number): boolean {
    if (this.rangeStartIndex === null) return false;
    if (this.rangeEndIndex === null) {
      return index === this.rangeStartIndex;
    }
    

    const min = Math.min(this.rangeStartIndex, this.rangeEndIndex);
    const max = Math.max(this.rangeStartIndex, this.rangeEndIndex);

    return index >= min && index <= max;
  }

  // ===== GET RANGE INFO =====
  get selectedCount(): number {
    if (this.rangeStartIndex === null) return 0;
    if (this.rangeEndIndex === null) return 1;

    return Math.abs(this.rangeEndIndex - this.rangeStartIndex) + 1;
  }

  get selectedRangeLabel(): string {
    if (this.rangeStartIndex === null) return '';

    if (this.rangeEndIndex === null) {
      return this.timeSlots[this.rangeStartIndex].time;
    }

    const min = Math.min(this.rangeStartIndex, this.rangeEndIndex);
    const max = Math.max(this.rangeStartIndex, this.rangeEndIndex);

    return `${this.timeSlots[min].time} - ${this.timeSlots[max].time}`;
  }

  get hasPendingChange(): boolean {
    if (this.editMode === 'main') {
      return this.selectedMainStatus !== this.slots[0]?.status;
    }

    if (this.editMode === 'time') {
      return this.selectedCount > 0;
    }

    return false;
  }

  isOutOfAllowedRange(index: number): boolean {

    if (this.rangeStartIndex === null) return false;

    if (
      this.allowedMinIndex === null ||
      this.allowedMaxIndex === null
    ) return false;

    return index < this.allowedMinIndex || index > this.allowedMaxIndex;
  }

  // ===== APPLY STATUS (Mock) =====
  applyRangeStatus() {

    if (this.rangeStartIndex === null) return;

    const min = this.rangeEndIndex === null
      ? this.rangeStartIndex
      : Math.min(this.rangeStartIndex, this.rangeEndIndex);

    const max = this.rangeEndIndex === null
      ? this.rangeStartIndex
      : Math.max(this.rangeStartIndex, this.rangeEndIndex);

    for (let i = min; i <= max; i++) {
      this.timeSlots[i].status = this.pendingStatus;
    }

    this.cancelRange();
  }

  // ===== CANCEL =====
  cancelRange() {
    this.rangeStartIndex = null;
    this.rangeEndIndex = null;
    this.allowedMinIndex = null;
    this.allowedMaxIndex = null;
  }

  getStatusLabel(status: SlotStatus): string {
    switch (status) {
      case 'available':
        return 'พร้อมใช้งาน';
      case 'reserved':
        return 'ถูกจอง';
      case 'maintenance':
        return 'ปิดปรับปรุง';

      default:
        return status;
    }
  }
  onCancelClick() {

    if (this.editMode === 'main') {
      this.selectedMainStatus = this.slots[0]?.status;
      return;
    }

    if (this.editMode === 'time') {
      this.cancelRange();
    }
  }

  // =========================
  // MAIN STATUS (ยังใช้ API เดิม)
  // =========================

  get slotCount(): number {
    return this.slots.length;
  }
  updateStatus() {

    if (!this.token || this.isUpdating || !this.hasPendingChange) return;

    this.isUpdating = true;

    // ===== MAIN MODE =====
    if (this.editMode === 'main') {

      const entities = this.slots.map(slot => ({
        entity_type: 'slots',
        entity_id: slot.id,
        updates: {
          status: this.selectedMainStatus
        }
      }));

      this.parkingService.updateEntities(entities, this.token)
        .pipe(finalize(() => this.isUpdating = false))
        .subscribe({
          next: () => {
            this.updated.emit(this.selectedMainStatus);
          },
          error: (err) => console.error(err)
        });

      return;
    }

    // ===== TIME MODE =====
    if (this.editMode === 'time') {

      if (!this.slots.length || !this.token) {
        this.isUpdating = false;
        return;
      }
        // 👇 เพิ่มตรงนี้
      if (this.scheduleMode !== 'single') {
        alert('ยังไม่รองรับโหมดนี้');
        this.isUpdating = false;
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

      const payload: any = {
        slot_id: slotId,
        mode: this.scheduleMode,
        time_ranges: [
          {
            start_time: startTime,
            end_time: endTime,
            status: this.pendingStatus
          }
        ]
      };

      if (this.scheduleMode === 'single' && !this.selectedDate) {
        this.isUpdating = false;
        return;
      }

      payload.date = this.selectedDate;

      console.log('Payload:', payload);

      this.parkingService
        .upsertSlotOverride(payload, this.token)
        .pipe(finalize(() => this.isUpdating = false))
        .subscribe({
          next: () => {
            this.lastLoadedDate = undefined;   // 👈 เพิ่มบรรทัดนี้
            this.loadSchedule();   // reload หลัง update
            this.cancelRange();
          },
          error: (err) => {
            console.error('Update time slot failed', err);
          }
        });

      return;
    }
  }
  /*updateMainStatus(newStatus: SlotStatus) {
    if (!this.token || this.isUpdating) return;

    this.isUpdating = true;
    const entities = this.slots.map(slot => ({
      entity_type: 'slots',
      entity_id: slot.id,
      updates: {
        status: newStatus
      }
    }));

    this.parkingService.updateEntities(entities, this.token)
      .pipe(
        finalize(() => this.isUpdating = false)
      )
      .subscribe({
        next: () => {
          this.updated.emit(newStatus);
        },
        error: (err) => {
          console.error('Update failed:', err);
        } 
      });
  }*/

  onClose() {
    this.close.emit();
  }
}