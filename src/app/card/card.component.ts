import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    InputIconModule
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  
  selectedDate: Date | undefined;
  selectedReservations: any[] = [];

  // Metrics Data
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
];

  ngOnInit() {}

  // Helper for Tag Severity
  // Note: p-tag uses 'warning', p-button uses 'warn'
  getSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'ใช้งานแล้ว': return 'success';
      case 'ยังไม่ถึงกำหนด': return 'warning';
      case 'หมดอายุ': return 'danger';
      default: return 'info';
    }
  }
}