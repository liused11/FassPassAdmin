import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SortEvent } from 'primeng/api';

// PrimeNG Modules
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
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReservationService } from '../service/reservation.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    CheckboxModule,
    TableModule,
    DropdownModule,
    CalendarModule,
    IconFieldModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit, OnDestroy {
  // ... (properties)
  realtimeChannel: any;



  ngOnDestroy() {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
    }
  }

  setupRealtimeSubscription() {
    this.realtimeChannel = this.supabase
      .channel('public:reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          console.log('Change received!', payload);
          this.loadReservationData();
        }
      )
      .subscribe();
  }
  // ...
  // ===============================
  // Supabase client 
  // ===============================
  supabase: SupabaseClient = createClient(
    'https://unxcjdypaxxztywplqdv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA'
  );

  selectedDate: Date | undefined;
  selectedReservations: any[] = [];
  loading = false;

  /*// Metrics Data
  metrics = [
    { title: 'รายการจอง', value: '1,247', subtext: '+2 การจอง', icon: 'pi pi-users' },
    { title: 'การจองที่ยังไม่ถึงเวลา', value: '892', subtext: '+1 การจอง', icon: 'pi pi-clock' },
    { title: 'การจองที่ถึงกำหนด', value: '267', subtext: '+1 การจอง', icon: 'pi pi-check-circle' },
    { title: 'การจองที่หมดอายุ', value: '88', subtext: '+1 การจอง', icon: 'pi pi-exclamation-circle' }
  ];

  // Table Data
  reservations = [
    // --- เดือนสิงหาคม (อดีต - ใช้งานแล้ว/หมดอายุ) ---
    { user: 'กานดา มีทรัพย์', id: 'T25680801', date: '01/08/2568', time: '09.00-12.00', room: 'E12-201', type: 'Meeting', invitee: 'ทีมการตลาด', status: 'ใช้งานแล้ว' },
    { user: 'สมชาย ใจดี', id: 'T25680818', date: '18/08/2568', time: '00.00-23.59', room: 'E12-203', type: '1-Day', invitee: '-', status: 'ใช้งานแล้ว' },
    { user: 'วันดี สุขใจ', id: 'A25680820', date: '20/08/2568', time: '00.00-23.59', room: 'E12-203', type: '1-Day', invitee: 'สมชาย ใจดี', status: 'ยังไม่ใช้งาน' }, // (Data เดิม)
    { user: 'วิชัย เก่งงาน', id: 'W25680825', date: '25/08/2568', time: '13.00-17.00', room: 'E12-205', type: 'Business', invitee: '-', status: 'หมดอายุ' },
    
    // --- เดือนกันยายน (อดีต/ปัจจุบัน) ---
    { user: 'มั่งมี ศรีสุข', id: 'S25680902', date: '02/09/2568', time: '8.00-17.00', room: 'E12-203', type: 'Business', invitee: 'สมชาย ใจดี', status: 'หมดอายุ' },
    { user: 'ปีเตอร์ ปาร์ค', id: 'P25680910', date: '10/09/2568', time: '00.00-23.59', room: 'E12-204', type: '1-Day', invitee: '-', status: 'ใช้งานแล้ว' },
    { user: 'ณัฐพล คนขยัน', id: 'N25680915', date: '15/09/2568', time: '09.00-18.00', room: 'E12-Meeting1', type: 'Meeting', invitee: 'ลูกค้า VIP', status: 'ยกเลิก' },
    { user: 'มกรา ปีใหม่', id: 'T25680923', date: '23/09/2568', time: '8.00-17.00', room: 'E12-203', type: 'Business', invitee: '-', status: 'หมดอายุ' },
    { user: 'ลลิตา น่ารัก', id: 'L25680930', date: '30/09/2568', time: '13.00-16.00', room: 'E12-202', type: 'Business', invitee: '-', status: 'ใช้งานแล้ว' },

    // --- เดือนตุลาคม (ปัจจุบัน/อนาคตใกล้) ---
    { user: 'แสน สาหัส', id: 'U25681013', date: '13/10/2568', time: '00.00-23.59', room: 'E12-203', type: '1-Day', invitee: '-', status: 'ใช้งานแล้ว' },
    { user: 'สมยศ ยอดเยี่ยม', id: 'Y25681014', date: '14/10/2568', time: '08.00-12.00', room: 'E12-201', type: 'Half-Day', invitee: '-', status: 'ยังไม่ใช้งาน' },
    { user: 'ดูดี หล่อรวย', id: 'U25681016', date: '16/10/2568', time: '8.00-17.00', room: 'E12-203', type: 'Business', invitee: 'สมชาย ใจดี', status: 'ยังไม่ใช้งาน' },
    { user: 'จิราพร อ่อนหวาน', id: 'J25681020', date: '20/10/2568', time: '10.00-12.00', room: 'E12-Meeting2', type: 'Meeting', invitee: 'ทีม Dev', status: 'ยังไม่ใช้งาน' },
    { user: 'ทศพล คนจริง', id: 'T25681025', date: '25/10/2568', time: '00.00-23.59', room: 'E12-204', type: '1-Day', invitee: 'เพื่อนร่วมงาน', status: 'ยังไม่ใช้งาน' },
    { user: 'เอกชัย ไชโย', id: 'E25681028', date: '28/10/2568', time: '09.00-17.00', room: 'E12-205', type: 'Business', invitee: '-', status: 'ยกเลิก' },

    // --- เดือนพฤศจิกายน (อนาคต - จองล่วงหน้า) ---
    { user: 'สมร รักดี', id: 'A25681105', date: '05/11/2568', time: '00.00-23.59', room: 'E12-203', type: '1-Day', invitee: 'สมชาย ใจดี', status: 'ใช้งานแล้ว' }, // (Data เดิม - อาจจะเป็นการจองย้อนหลังหรือข้อมูลตัวอย่าง)
    { user: 'บุญมี มีบุญ', id: 'B25681110', date: '10/11/2568', time: '08.00-17.00', room: 'E12-201', type: 'Business', invitee: '-', status: 'ยังไม่ใช้งาน' },
    { user: 'กมลชนก ปกป้อง', id: 'K25681115', date: '15/11/2568', time: '13.00-17.00', room: 'E12-202', type: 'Half-Day', invitee: '-', status: 'ยังไม่ใช้งาน' },
    { user: 'วิทยา พาเพลิน', id: 'W25681122', date: '22/11/2568', time: '09.00-16.00', room: 'E12-Meeting1', type: 'Meeting', invitee: 'ทีม HR', status: 'ยังไม่ใช้งาน' },
    { user: 'สุดสวย รวยเสน่ห์', id: 'S25681128', date: '28/11/2568', time: '00.00-23.59', room: 'E12-203', type: '1-Day', invitee: '-', status: 'ยังไม่ใช้งาน' },

    // --- เดือนธันวาคม (อนาคตไกล) ---
    { user: 'อาทิตย์ สดใส', id: 'A25681201', date: '01/12/2568', time: '08.00-17.00', room: 'E12-205', type: 'Business', invitee: '-', status: 'ยังไม่ใช้งาน' },
    { user: 'นภา ฟ้าคราม', id: 'N25681210', date: '10/12/2568', time: '00.00-23.59', room: 'E12-204', type: '1-Day', invitee: 'ครอบครัว', status: 'ยังไม่ใช้งาน' },
    { user: 'ธนา พาณิชย์', id: 'T25681225', date: '25/12/2568', time: '18.00-22.00', room: 'E12-EventHall', type: 'Event', invitee: 'พนักงานทุกคน', status: 'ยังไม่ใช้งาน' }
];*/

  metrics: any[] = [];
  reservations: any[] = [];
  allReservations: any[] = [];
  selectedFilter: string = 'รายการจองทั้งหมด';

  constructor(private reservationService: ReservationService) { }
  async ngOnInit() {
    // 🔐 mock login (เหมือนต้นแบบ)
    await this.supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: '12345678',
    });

    this.loadReservationData();
    this.setupRealtimeSubscription();
  }

  // ===============================
  // Load data from Edge
  // ===============================
  async loadReservationData() {
    this.loading = true;

    const { data } = await this.supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      console.error('No session token');
      this.loading = false;
      return;
    }

    // No date filter needed as per user request
    this.reservationService.getUserReservations(token).subscribe({
      next: (res: any) => {
        // Transform 'ยกเลิก' to 'หมดอายุ' as per requirement
        this.allReservations = res.reservations.map((r: any) => {
          if (r.status === 'ยกเลิก') {
            return { ...r, status: 'หมดอายุ' };
          }
          return r;
        });

        // Manual Metric Calculation
        const total = this.allReservations.length;
        const active = this.allReservations.filter(r => r.status === 'กำลังใช้งาน').length;
        const pending = this.allReservations.filter(r => r.status === 'จองล่วงหน้า').length;
        // Include 'หมดอายุ' and legacy 'หมดอายุ/สำเร็จ' in expired count
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

        this.filterReservations(this.selectedFilter); // Apply current filter
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load reservations', err);
        this.loading = false;
      },
    });
  }

  // ... (filterReservations)

  // ...

  getCustomTagStyle(status: string): any {
    if (status === 'จองล่วงหน้า') {
      return { 'background-color': '#FEF9C3', 'color': '#854D0E', 'border': '1px solid #FEF08A' }; // Yellow
    } else if (status === 'สำเร็จ') {
      return { 'background-color': '#F3E8FF', 'color': '#7E22CE', 'border': '1px solid #E9D5FF' }; // Purple 100/700/200
    }
    return {};
  }

  filterReservations(title: string) {
    this.selectedFilter = title;
    this.applyFilters();
  }

  onDateChange() {
    this.applyFilters();
  }

  clearDate() {
    this.selectedDate = undefined;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allReservations];

    // 1. Filter by Status (selectedFilter)
    const title = this.selectedFilter;
    const statusMap: { [key: string]: string | string[] } = {
      'รายการจองทั้งหมด': 'ALL',
      'กำลังใช้งาน': 'กำลังใช้งาน',
      'จองล่วงหน้า': 'จองล่วงหน้า',
      'หมดอายุ': ['หมดอายุ', 'expired', 'หมดอายุ/สำเร็จ'],
      'สำเร็จ': ['สำเร็จ', 'completed'],
      'ยกเลิก': ['ยกเลิก', 'cancelled'],
      'หมดอายุ/สำเร็จ': ['หมดอายุ', 'สำเร็จ', 'หมดอายุ/สำเร็จ', 'completed', 'expired']
    };

    const targetStatus = statusMap[title];

    if (targetStatus && targetStatus !== 'ALL') {
      if (Array.isArray(targetStatus)) {
        filtered = filtered.filter(r => targetStatus.includes(r.status));
      } else {
        filtered = filtered.filter(r => r.status === targetStatus);
      }
    }

    // 2. Filter by Date (selectedDate)
    if (this.selectedDate) {
      const filterDateStr = this.formatDateToThai(this.selectedDate);
      // Filter by 'date' (Booking Date) or 'reserved_at_date' based on requirement.
      // Usually "Date Filter" on a list refers to the main date column.
      filtered = filtered.filter(r => r.date === filterDateStr);
    }

    this.reservations = filtered;
  }

  formatDateToThai(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = (date.getFullYear() + 543).toString();
    return `${d}/${m}/${y}`;
  }

  getMetricCardClass(metric: any): string {
    const isSelected = this.selectedFilter === metric.title;
    const baseClass = 'shadow-2 border-round-xl h-full cursor-pointer border-2 transition-colors transition-duration-200';

    // Use metric.color if available, default to blue or gray
    const color = metric.color || 'blue';

    if (isSelected) {
      return `${baseClass} border-${color}-500 bg-${color}-50`;
    } else {
      return `${baseClass} border-transparent bg-white hover:border-${color}-200`;
    }
  }

  getMetricTextClass(metric: any, shade: number): string {
    const color = metric.color || 'blue';
    // Always color the text if desired, or only when selected? 
    // Usually metrics utilize color to distinguish themselves even when not selected.
    return `text-${color}-${shade}`;
  }

  getZone(room: string): string {
    if (!room) return '-';
    // Format: building-floor-zone-row-slot (e.g., 1-1-1-2-10)
    // The user says the 4th number (index 3 if split by -) determines zone: 1->A, 2->B
    const parts = room.split('-');
    if (parts.length >= 4) {
      const zoneNum = parseInt(parts[3], 10);
      if (!isNaN(zoneNum) && zoneNum > 0) {
        // 1 -> A, 2 -> B, etc.
        return String.fromCharCode(64 + zoneNum);
      }
    }
    return '-';
  }

  // Helper for Tag Severity
  // Note: p-tag uses 'warning', p-button uses 'warn'
  getSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'กำลังใช้งาน': return 'success';
      case 'จองล่วงหน้า': return 'warning';
      case 'หมดอายุ':
      case 'สำเร็จ':
      case 'หมดอายุ/สำเร็จ': return 'secondary';
      case 'pending': return 'warning';
      case 'ยกเลิก': return 'danger';
      default: return 'info';
    }
  }

  customSort(event: SortEvent) {
    if (!event.data || !event.field) return;

    event.data.sort((data1: any, data2: any) => {
      let value1 = data1[event.field!];
      let value2 = data2[event.field!];
      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if ((event.field === 'date' || event.field === 'reserved_at_date') && typeof value1 === 'string' && typeof value2 === 'string') {
        const parseDate = (dateStr: string) => {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const y = parseInt(parts[2], 10);
            return y * 10000 + m * 100 + d;
          }
          return 0;
        };
        const d1 = parseDate(value1);
        const d2 = parseDate(value2);

        if (d1 < d2) result = -1;
        else if (d1 > d2) result = 1;
        else {
          // Date is equal, compare time
          if (event.field === 'reserved_at_date') {
            const t1 = data1['reserved_at_time'] || '';
            const t2 = data2['reserved_at_time'] || '';
            result = t1.localeCompare(t2);
          } else if (event.field === 'date') {
            const t1 = data1['time'] || '';
            const t2 = data2['time'] || '';
            result = t1.localeCompare(t2);
          } else {
            result = 0;
          }
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
}