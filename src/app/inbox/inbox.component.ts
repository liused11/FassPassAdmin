// app/inbox/inbox.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ParkingService } from '../service/inbox-parking.service';
import { createClient } from '@supabase/supabase-js';
import { HttpClientModule } from '@angular/common/http';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CheckboxModule,
    CardModule,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    HttpClientModule,
    RouterOutlet,
    ProgressSpinnerModule
  ],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {
  // Metrics Summary for Buildings
  /*metrics = [
    { title: 'อาคารทั้งหมด', value: '23', icon: 'pi pi-map-marker' },
    { title: 'จำนวนห้องทั้งหมด', value: '454', icon: 'pi pi-car' },
    { title: 'ผู้มาเยี่ยมในขณะนี้', value: '76', icon: 'pi pi-bolt' }, // EV icon
    { title: 'การจองทั้งหมดในวันนี้', value: '226', icon: 'pi pi-directions' } // Bike icon
  ];*/

  // Building Table Data
  /*buildings = [
    { 
      name: 'อาคารเรียนรวม 12 ชั้น', 
      detail: 'เวลาเปิด-ปิด: 08:00 - 22:00 น.', 
      zone: 'Zone A', 
      visitors: 145, 
      bookings: 52, 
      status: 'เปิดทำการ' 
    },
    { 
      name: 'อาคาร HM', 
      detail: 'เวลาเปิด-ปิด: 08:00 - 20:00 น.', 
      zone: 'Zone A', 
      visitors: 78, 
      bookings: 25, 
      status: 'เปิดทำการ' 
    },
    { 
      name: 'อาคาร ECC', 
      detail: 'เวลาเปิด-ปิด: 08:00 - 20:00 น.', 
      zone: 'Zone A', 
      visitors: 112, 
      bookings: 38, 
      status: 'เปิดทำการ' 
    },
    { 
      name: 'อาคาร E12', 
      detail: 'เวลาเปิด-ปิด: 08:30 - 18:00 น.', 
      zone: 'Zone B', 
      visitors: 65, 
      bookings: 15, 
      status: 'กำลังจะปิด' 
    },
    { 
      name: 'อาคารภาควิชาวิศวกรรมโทรคมนาคม', 
      detail: 'เวลาเปิด-ปิด: 08:30 - 16:30 น.', 
      zone: 'Zone A', 
      visitors: 34, 
      bookings: 8, 
      status: 'ปิดทำการ' 
    },
    { 
      name: 'อาคารพระจอมเกล้า', 
      detail: 'เวลาเปิด-ปิด: 08:00 - 17:00 น.', 
      zone: 'Zone A', 
      visitors: 45, 
      bookings: 10, 
      status: 'ปิดทำการ' 
    },
    { 
      name: 'ศูนย์เรียนรวมสมเด็จพระเทพฯ', 
      detail: 'เวลาเปิด-ปิด: 07:00 - 19:00 น.', 
      zone: 'Zone C', 
      visitors: 230, 
      bookings: 5, 
      status: 'เปิดทำการ' 
    },
    { 
      name: 'อาคารวิศวกรรมการวัดและควบคุม', 
      detail: 'เวลาเปิด-ปิด: 08:30 - 16:30 น.', 
      zone: 'Zone A', 
      visitors: 22, 
      bookings: 12, 
      status: 'เปิดทำการ' 
    },
    { 
      name: 'โรงงานวิศวกรรมอุตสาหการ', 
      detail: 'เวลาเปิด-ปิด: 08:30 - 17:00 น.', 
      zone: 'Zone B', 
      visitors: 40, 
      bookings: 18, 
      status: 'กำลังจะปิด' 
    },
    { 
      name: 'อาคารภาควิชาวิศวกรรมคอมพิวเตอร์', 
      detail: 'เวลาเปิด-ปิด: 24 ชั่วโมง', 
      zone: 'Zone A', 
      visitors: 55, 
      bookings: 30, 
      status: 'เปิดทำการ' 
    }
  ];*/

  supabase = createClient(
    'https://unxcjdypaxxztywplqdv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA'
  );

  metrics: any[] = [];
  buildings: any[] = [];

  selectedBuildings: any[] = [];
  loading: boolean = false;

  constructor(private parkingService: ParkingService) { }

  async ngOnInit() {
    this.loading = true; // Start loading
    await this.supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: '12345678'
    });
    this.loadDashboard();
  }

  async loadDashboard() {
    const { data } = await this.supabase.auth.getSession();

    const token = data.session?.access_token;

    if (!token) {
      console.error('No session token');
      this.loading = false;
      return;
    }
    this.parkingService.getDashboard(token).subscribe(res => {
      console.log(res);

      this.metrics = res.metrics ?? [];

      const summary = res.parking_summary ?? [];

      this.buildings = summary.map((b: any) => ({
        name: b.name,
        capacity: b.total > 0
          ? `${b.total - b.used}/${b.total}`// ความจุ
          : '-',
        types: b.types ?? [],  // ประเภท
        detail: `เวลาเปิด-ปิด: ${b.open_time} - ${b.close_time}`,
        status: b.status,
        price: b.price,
        rate: b.rate,
        openTime: b.open_time,
        closeTime: b.close_time
      }));
      this.loading = false; // Stop loading
    }, err => {
      console.error(err);
      this.loading = false;
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'ใช้งานอยู่': return 'success';
      case 'เต็ม': return 'danger';
      case 'ไม่มีข้อมูล': return 'secondary';
      default: return 'info';
    }
  }
}