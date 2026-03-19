import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 
import { SortEvent } from 'primeng/api';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { ReservationService } from '../service/reservation.service';
// ❌ ลบ UserService และ BuildingService ออกแล้ว เพื่อแก้ปัญหาหาไฟล์ไม่เจอ
import { supabase } from '../supabase.config';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule, 
    CardModule, ButtonModule, TagModule, InputTextModule, 
    CheckboxModule, TableModule, DropdownModule, CalendarModule, 
    IconFieldModule, InputIconModule, DialogModule, ToastModule, 
    ConfirmDialogModule, ProgressSpinnerModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService], 
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit, OnDestroy {
  
  realtimeChannel: any;
  activeView: 'parking' | 'ticket' | 'building' = 'parking';

  allReservations: any[] = [];
  reservations: any[] = [];
  accessTickets: any[] = [];
  buildingReservations: any[] = [];

  metrics: any[] = [];
  userOptions: any[] = []; 
  buildingsList: any[] = [];
  buildingOptions: any[] = [];
  roomGroupOptions: any[] = [];
  
  selectedReservations: any[] = []; 
  displayAddModal: boolean = false;
  loading: boolean = false;
  
  selectedFilter: string = 'รายการจองทั้งหมด';
  selectedDate: Date | undefined;
  
  newRes: any = {
    user: null, date: null as Date | null, startTime: null as Date | null,
    endTime: null as Date | null, time: '', selectedBuilding: null,
    room: null, type: 'Meeting', invitee: ''
  };

  typeOptions = [
    { label: 'Meeting', value: 'Meeting' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Visit', value: 'Visit' }
  ];

  // ✅ ลบ service ที่ไม่มีออกไป เหลือแค่ที่จำเป็น
  constructor(
    private reservationService: ReservationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    this.loadReservations(); 
    this.loadUsersForDropdown(); 
    this.loadBuildings();
    this.setupRealtimeSubscription(); 
  }

  ngOnDestroy() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }
  }

  setupRealtimeSubscription() {
    this.realtimeChannel = supabase
      .channel('public:reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload: any) => { // ✅ เติม : any
          console.log('🔄 Database changed:', payload);
          this.loadReservations(); 
        }
      )
      .subscribe();
  }

  // ✅ ใช้ Mock Data แทน Service ที่หายไป
  loadBuildings() {
    const mockData: any[] = [
      { 
        name: 'ตึก 12 ชั้น', 
        floors: [
          { floorName: 'ชั้น 1', rooms: [{ name: 'Meeting Room 1', status: 'ว่าง' }, { name: 'Meeting Room 2', status: 'จองแล้ว' }] },
          { floorName: 'ชั้น 2', rooms: [{ name: 'Board Room', status: 'ว่าง' }] }
        ] 
      },
      { 
        name: 'อาคารสำนักงานใหญ่', 
        floors: [
          { floorName: 'โซน A', rooms: [{ name: 'A101', status: 'ว่าง' }] }
        ] 
      }
    ];
    this.buildingsList = mockData;
    this.buildingOptions = mockData.map((b: any) => ({ label: b.name, value: b })); // ✅ เติม : any
  }

  // ✅ ใช้ Mock Data แทน Service ที่หายไป
  loadUsersForDropdown() {
    const mockUsers: any[] = [
      { firstName: 'สมชาย', lastName: 'ใจดี', company: 'Partner Co.', category: 'Hybrid' },
      { firstName: 'กานดา', lastName: 'มีทรัพย์', company: 'Vendor Ltd.', category: 'External' }
    ];
    
    const filtered = mockUsers.filter((u: any) => u.category === 'Hybrid' || u.category === 'External'); // ✅ เติม : any
    this.userOptions = filtered.map((u: any) => ({ // ✅ เติม : any
      label: `${u.firstName} ${u.lastName} (${u.company})`,
      value: `${u.firstName} ${u.lastName}`
    }));
  }

  async loadReservations() {
    this.loading = true;
    
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    if (!token) {
      console.error('No session token');
      this.loading = false;
      return;
    }

    // 1️⃣ ดึงข้อมูลที่จอดรถ
    this.reservationService.getUserReservations(token).subscribe({
      next: (res: any) => {
        this.allReservations = res.reservations.map((r: any) => {
          if (r.status === 'ยกเลิก') return { ...r, status: 'หมดอายุ' };
          return r;
        });

        const total = this.allReservations.length;
        const active = this.allReservations.filter(r => r.status === 'กำลังใช้งาน').length;
        const pending = this.allReservations.filter(r => r.status === 'จองล่วงหน้า').length;
        const expired = this.allReservations.filter(r => ['หมดอายุ', 'expired', 'หมดอายุ/สำเร็จ'].includes(r.status)).length;
        const completed = this.allReservations.filter(r => ['สำเร็จ', 'completed'].includes(r.status)).length;
        const cancelled = this.allReservations.filter(r => ['ยกเลิก', 'cancelled'].includes(r.status)).length;

        this.metrics = [
          { title: 'รายการจองทั้งหมด', value: total.toString(), subtext: 'รายการ', icon: 'pi pi-list', color: 'blue' },
          { title: 'สำเร็จ', value: completed.toString(), subtext: 'เรียบร้อย', icon: 'pi pi-check', color: 'purple' },
          { title: 'กำลังใช้งาน', value: active.toString(), subtext: 'ขณะนี้', icon: 'pi pi-check-circle', color: 'green' },
          { title: 'จองล่วงหน้า', value: pending.toString(), subtext: 'ยังไม่ถึงเวลา', icon: 'pi pi-clock', color: 'yellow' },
          { title: 'หมดอายุ', value: expired.toString(), subtext: 'เลยเวลา', icon: 'pi pi-exclamation-circle', color: 'gray' },
          { title: 'ยกเลิก', value: cancelled.toString(), subtext: 'ยกเลิกแล้ว', icon: 'pi pi-times-circle', color: 'red' }
        ];

        this.filterReservations(this.selectedFilter);
      },
      error: (err: any) => console.error('Failed to load reservations', err)
    });

    // 2️⃣ ดึงข้อมูลตั๋วเข้าอาคาร
    this.reservationService.getAccessTickets(token).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.accessTickets = res.data.map((item: any) => {
            return {
              id: item.id,
              invite_code: item.invite_code,
              guest_first_name: item.guest_first_name || item.name || 'ไม่ระบุชื่อ',
              guest_last_name: item.guest_last_name || '',
              guest_company: item.guest_company || item.company || '-',
              pass_type: item.pass_type || '1-Day Pass',
              status: item.ticket_status || item.status || 'Active',
              host_id: item.host_id,
              created_at: item.created_at,
              building_id: item.building_id,
            };
          }).sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
      },
      error: (err: any) => console.error('Failed to load tickets', err)
    });

    // 3️⃣ ดึงข้อมูลการจองสถานที่
    this.reservationService.getBuildingReservations(token).subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res)) {
          this.buildingReservations = res.map((booking: any) => {
            return {
              id: booking.id,
              invite_code: booking.invite_code,
              building_name: booking.building_name,
              room_name: booking.room_name || booking.floor_name || '-',
              reserved_date: booking.reserved_date,
              start_time: booking.start_time,
              end_time: booking.end_time,
              status: booking.status || 'Active',
              created_at: booking.created_at
            };
          });
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load building reservations', err);
        this.loading = false;
      }
    });
  }

  switchView(view: 'parking' | 'ticket' | 'building') {
    this.activeView = view;
  }

  applyFilters() {
    let filtered = [...this.allReservations];
    
    const statusMap: { [key: string]: string | string[] } = {
      'รายการจองทั้งหมด': 'ALL',
      'กำลังใช้งาน': 'กำลังใช้งาน',
      'จองล่วงหน้า': 'จองล่วงหน้า',
      'หมดอายุ': ['หมดอายุ', 'expired', 'หมดอายุ/สำเร็จ'],
      'สำเร็จ': ['สำเร็จ', 'completed'],
      'ยกเลิก': ['ยกเลิก', 'cancelled'],
      'หมดอายุ/สำเร็จ': ['หมดอายุ', 'สำเร็จ', 'หมดอายุ/สำเร็จ', 'completed', 'expired']
    };

    const targetStatus = statusMap[this.selectedFilter] || 'ALL';

    if (targetStatus !== 'ALL') {
      if (Array.isArray(targetStatus)) {
        filtered = filtered.filter(r => targetStatus.includes(r.status));
      } else {
        filtered = filtered.filter(r => r.status === targetStatus);
      }
    }

    if (this.selectedDate) {
      const filterDateStr = this.formatDateToThai(this.selectedDate);
      filtered = filtered.filter(r => r.date === filterDateStr);
    }
    
    this.reservations = filtered;
  }

  updateStatus(reservation: any, newStatus: string) {
    const payload = { status: newStatus };
    const targetId = reservation._raw?.id || reservation.id;
    
    this.reservationService.updateReservation(targetId, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: `เปลี่ยนสถานะเป็น "${newStatus}" เรียบร้อยแล้ว` });
      },
      error: (err: any) => {
        console.error('Error updating status:', err);
        this.messageService.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'ไม่สามารถอัปเดตสถานะได้' });
      }
    });
  }

  onBuildingSelect() {
    this.newRes.room = null;
    const building = this.newRes.selectedBuilding;
    if (!building || !building.floors) {
      this.roomGroupOptions = [];
      return;
    }

    this.roomGroupOptions = building.floors.map((floor: any) => ({
      label: floor.floorName,
      items: floor.rooms.map((room: any) => {
        const roomName = typeof room === 'string' ? room : room.name;
        const roomStatus = typeof room === 'string' ? 'ว่าง' : room.status;

        return {
          label: roomStatus === 'ว่าง' ? roomName : `${roomName} (${roomStatus})`,
          value: roomName,
          disabled: roomStatus !== 'ว่าง' 
        };
      })
    }));
  }

  confirmUpdateStatus(reservation: any, newStatus: string) {
    const actionText = newStatus === 'อนุมัติแล้ว' ? 'อนุมัติ' : 'ปฏิเสธ';
    const iconClass = newStatus === 'อนุมัติแล้ว' ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500';
    const buttonClass = newStatus === 'อนุมัติแล้ว' ? 'p-button-success' : 'p-button-danger';

    this.confirmationService.confirm({
      message: `คุณแน่ใจหรือไม่ที่จะ <b>${actionText}</b> สิทธิ์การเข้าอาคารของ <b>${reservation.user}</b>?`,
      header: `ยืนยันการ${actionText}`,
      icon: iconClass,
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: buttonClass,
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.updateStatus(reservation, newStatus);
      }
    });
  }

  showAddModal() {
    this.displayAddModal = true;
    this.newRes = { 
        user: null, date: null, startTime: null, endTime: null, time: '', 
        selectedBuilding: null, room: null, type: 'Meeting', invitee: '' 
    };
    this.roomGroupOptions = [];
  }

  saveReservation() {
    if (this.newRes.startTime && this.newRes.endTime) {
        const startH = String(this.newRes.startTime.getHours()).padStart(2, '0');
        const startM = String(this.newRes.startTime.getMinutes()).padStart(2, '0');
        const endH = String(this.newRes.endTime.getHours()).padStart(2, '0');
        const endM = String(this.newRes.endTime.getMinutes()).padStart(2, '0');
        this.newRes.time = `${startH}:${startM}-${endH}:${endM}`;
    }

    if (!this.newRes.user || !this.newRes.date || !this.newRes.room) {
      this.messageService.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'กรุณากรอกข้อมูลให้ครบ' });
      return;
    }

    const validFrom = new Date(this.newRes.date);
    if(this.newRes.startTime) {
      validFrom.setHours(this.newRes.startTime.getHours(), this.newRes.startTime.getMinutes());
    }

    const expiresAt = new Date(this.newRes.date);
    if(this.newRes.endTime) {
      expiresAt.setHours(this.newRes.endTime.getHours(), this.newRes.endTime.getMinutes());
    }

    const payload = {
        host_id: this.newRes.user, 
        valid_from: validFrom.toISOString(),
        expires_at: expiresAt.toISOString(),
        building_id: this.newRes.selectedBuilding.name,
        room_id: this.newRes.room,
        pass_type: this.newRes.type,
        invite_code: this.newRes.invitee || `INV-${Math.floor(Math.random() * 10000)}`, 
        status: 'รออนุมัติ' 
    };

    this.reservationService.createReservation(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: 'เพิ่มการจองเรียบร้อย' });
        this.displayAddModal = false;
      },
      error: (err: any) => {
        console.error('Error creating reservation:', err);
        this.messageService.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'ไม่สามารถสร้างการจองได้' });
      }
    });
  }

  filterReservations(title: string) {
    this.selectedFilter = title;
    this.applyFilters();
  }

  onDateChange() { this.applyFilters(); }
  clearDate() { this.selectedDate = undefined; this.applyFilters(); }

  customSort(event: SortEvent) {
    if (!event.data || !event.field) return;

    event.data.sort((data1: any, data2: any) => {
      let value1 = data1[event.field!];
      let value2 = data2[event.field!];
      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (event.field === 'date' && typeof value1 === 'string' && typeof value2 === 'string') {
        const parseDate = (dateStr: string) => {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return parseInt(parts[2], 10) * 10000 + parseInt(parts[1], 10) * 100 + parseInt(parts[0], 10);
          }
          return 0;
        };
        const d1 = parseDate(value1);
        const d2 = parseDate(value2);

        if (d1 < d2) result = -1;
        else if (d1 > d2) result = 1;
        else {
          const t1 = data1['time'] || '';
          const t2 = data2['time'] || '';
          result = t1.localeCompare(t2);
        }
      }
      else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2, undefined, { numeric: true });
      }
      else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }

      return (event.order || 1) * (result || 0);
    });
  }

  formatDateToThai(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = (date.getFullYear() + 543).toString();
    return `${d}/${m}/${y}`;
  }

  getCustomTagStyle(status: string): any {
    if (status === 'จองล่วงหน้า') return { 'background-color': '#FEF9C3', 'color': '#854D0E', 'border': '1px solid #FEF08A' };
    if (status === 'สำเร็จ') return { 'background-color': '#F3E8FF', 'color': '#7E22CE', 'border': '1px solid #E9D5FF' }; 
    return {};
  }

  getZone(room: string): string {
    if (!room) return '-';
    const parts = room.split('-');
    if (parts.length >= 4) {
      const zoneNum = parseInt(parts[3], 10);
      if (!isNaN(zoneNum) && zoneNum > 0) return String.fromCharCode(64 + zoneNum);
    }
    return '-';
  }

  getSeverity(status: string): any {
    switch (status) {
      case 'อนุมัติแล้ว': 
      case 'สำเร็จ': return 'success';
      case 'กำลังใช้งาน': return 'info';
      case 'รออนุมัติ':
      case 'จองล่วงหน้า': return 'warning';
      case 'ปฏิเสธ':
      case 'หมดอายุ': 
      case 'ยกเลิก': return 'danger';
      default: return 'info';
    }
  }

  getMetricCardClass(metric: any): string {
    const isSelected = this.selectedFilter === metric.title;
    const baseClass = 'shadow-2 border-round-xl h-full cursor-pointer border-2 transition-colors transition-duration-200';
    const color = metric.color || 'blue';

    if (isSelected) {
      return `${baseClass} border-${color}-500 bg-${color}-50`;
    } else {
      return `${baseClass} border-transparent bg-white hover:border-${color}-200`;
    }
  }

  getMetricTextClass(metric: any, shade: number): string {
    const color = metric.color || 'blue';
    return `text-${color}-${shade}`;
  }
}