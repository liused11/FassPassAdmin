import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';

// ✅ นำเข้า Module สำหรับแจ้งเตือนและ Popup ยืนยัน (ฟีเจอร์ของคุณ)
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UserManagementService, UserManagementResponse } from '../service/user-management.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase.config';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  category: 'Internal' | 'External' | 'Hybrid' | 'Admin Management' | '';
  role: string;
  authMethod: string;
  status: string;
  lastActive: string;
  registerDate: string;
  expiryDate: string | null;
  avatarUrl?: string;
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule,
    TableModule, ButtonModule, CardModule, DropdownModule,
    CalendarModule, InputTextModule, IconFieldModule, InputIconModule,
    AvatarModule, TagModule, TooltipModule, BadgeModule, ProgressSpinnerModule,
    ConfirmDialogModule, ToastModule, DialogModule // ✅ เพิ่มลง imports
  ],
  templateUrl: './customer.component.html',
  styles: [`
    .overflow-x-auto::-webkit-scrollbar { display: none; }
    .overflow-x-auto { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  // ✅ เพิ่ม Service ของ Popup ยืนยันลงใน Providers
  providers: [UserManagementService, ConfirmationService, MessageService]
})
export class CustomerComponent implements OnInit {

  selectedCategory: string = 'All';
  selectedUsers: User[] = [];
  selectedDate: Date | undefined;

  supabase: SupabaseClient = supabase; 

  metrics: { title: string, value: string, subtext: string, icon: string }[] = [];
  
  // (เว้นตัวแปร Options ต่างๆ ไว้เหมือนเดิม)
  roleOptions = [
    { label: 'Role ทั้งหมด', value: null },
    { label: 'Super Admin', value: 'Super Admin' },
    { label: 'Staff (พนักงาน)', value: 'Employee' },
    { label: 'Hybrid Tech (ช่างประจำ)', value: 'Hybrid Tech' },
    { label: 'Consultant (ที่ปรึกษา)', value: 'Consultant' },
    { label: 'Security (รปภ.)', value: 'Security' },
    { label: 'Technician (ช่างรายครั้ง)', value: 'Technician' },
    { label: 'Guest', value: 'Guest' },
    { label: 'User', value: 'User' },
    { label: 'Visitor', value: 'Visitor' }
  ];

  authOptions = [
    { label: 'ช่องทางทั้งหมด', value: null },
    { label: 'App / Line OA', value: 'Line OA' },
    { label: 'Kiosk (Walk-in)', value: 'Kiosk' },
    { label: 'Face Scan', value: 'Face Scan' },
    { label: 'แลกบัตร (ID Card)', value: 'ID Exchange' }
  ];

  statusOptions = [
    { label: 'สถานะ', value: null },
    { label: 'Active', value: 'Active' },
    { label: 'Checked In', value: 'Checked In' },
    { label: 'Checked Out', value: 'Checked Out' },
    { label: 'Blacklist', value: 'Blacklist' }
  ];

  allUsers: User[] = [];
  loading: boolean = false;

  // ✅ Inject Message และ Confirmation Service เข้ามา
  constructor(
    private userManagementService: UserManagementService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  async ngOnInit() {
    this.loading = true;
    const { data: { session } } = await this.supabase.auth.getSession();

    if (!session) {
      await this.supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: '12345678'
      });
    }
    this.loadData();
  }

  async loadData() {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      console.error('No session token available');
      this.loading = false;
      return;
    }

    this.userManagementService.getProfiles(token).subscribe({
      next: (response: UserManagementResponse) => {
        if (response.metrics) {
          this.metrics = response.metrics.map(m => {
            let icon = 'pi pi-info-circle';
            if (m.title.includes('ทั้งหมด')) icon = 'pi pi-users';
            else if (m.title.includes('ผู้ดูแลระบบ') || m.title.includes('Admin')) icon = 'pi pi-shield';
            else if (m.title.includes('ทั่วไป') || m.title.includes('User')) icon = 'pi pi-user';

            return { title: m.title, value: m.value, subtext: m.subtext, icon: icon };
          });
        }

        if (response.profiles) {
          this.allUsers = response.profiles.map(p => {
            // ✅ นำระบบเดา Category ของคุณกลับมา เพื่อให้เมนูด้านซ้ายกรองข้อมูลได้จริง!
            let cat = 'External';
            if (p.role === 'Admin' || p.role === 'Super Admin') cat = 'Admin Management';
            else if (p.role === 'Staff' || p.role === 'Employee' || p.role === 'User') cat = 'Internal';
            else if (p.role === 'Partner' || p.role === 'Hybrid Tech') cat = 'Hybrid';

            return {
              id: p.id,
              firstName: p.name || 'ไม่มีชื่อ', 
              lastName: '',
              phone: p.phone || '-',
              email: p.email || '-',
              company: '-', 
              category: cat as any, // ใส่ Category ให้ตาราง
              role: p.role || 'Guest',
              authMethod: 'Email',
              status: 'Active', // ค่าเริ่มต้นให้เป็น Active
              lastActive: '-',
              registerDate: p.joined_date || p.created_at || '',
              expiryDate: null,
              avatarUrl: p.avatar
            };
          });
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching user profiles:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'ดึงข้อมูลไม่สำเร็จ' });
        this.loading = false;
      }
    });
  }

  // ✅ ระบบ Filter แบบอัปเกรด
  get filteredUsers() {
    if (this.selectedCategory === 'All') return this.allUsers;
    // ดักจับ Admin Management ให้แสดงผลคนที่เป็นแอดมิน
    if (this.selectedCategory === 'Admin Management') {
        return this.allUsers.filter(user => user.role === 'Admin' || user.role === 'Super Admin');
    }
    return this.allUsers.filter(user => user.category === this.selectedCategory);
  }

  setCategory(category: string) {
    this.selectedCategory = category;
  }

  getCount(category: string): number {
    if (category === 'All') return this.allUsers.length;
    return this.allUsers.filter(u => u.category === category).length;
  }

  // ✅ ระบบนับแอดมิน (ฟีเจอร์ของคุณ)
  getAdminCount(): number {
    return this.allUsers.filter(u => u.role === 'Admin' || u.role === 'Super Admin').length;
  }

  // ==========================================
  // ✅ ฟีเจอร์ของคุณ: จัดการ Blacklist, Promote, Demote
  // ==========================================
  toggleBlacklist(user: User) {
    const isCurrentlyBlacklisted = user.status === 'Blacklist';
    const newStatus = isCurrentlyBlacklisted ? 'Active' : 'Blacklist';
    const actionText = isCurrentlyBlacklisted ? 'ปลดแบล็คลิสต์' : 'แบล็คลิสต์';
    const iconClass = isCurrentlyBlacklisted ? 'pi pi-check-circle text-green-500' : 'pi pi-ban text-red-500';
    const buttonClass = isCurrentlyBlacklisted ? 'p-button-success' : 'p-button-danger';

    this.confirmationService.confirm({
      message: `คุณแน่ใจหรือไม่ที่จะ <b>${actionText}</b> ผู้ใช้งาน <b>${user.firstName}</b> ?`,
      header: `ยืนยันการ${actionText}`,
      icon: iconClass,
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: buttonClass,
      rejectButtonStyleClass: "p-button-text p-button-secondary",
      accept: () => {
        user.status = newStatus;
        if (newStatus === 'Blacklist') user.category = '' as any; // หรือเปลี่ยนเป็นหมวดแบล็คลิสต์
        this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: `ดำเนินการ${actionText}เรียบร้อยแล้ว` });
      }
    });
  }

  confirmPromote(user: User) {
    this.confirmationService.confirm({
      message: `คุณแน่ใจหรือไม่ที่จะเลื่อนขั้น <b>${user.firstName}</b> เป็น Admin?`,
      header: 'ยืนยันการเลื่อนขั้น (Promote)',
      icon: 'pi pi-arrow-up text-green-500',
      acceptLabel: 'ยืนยันการเลื่อนขั้น',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => { this.updateUserRole(user, 'Admin'); }
    });
  }

  confirmDemote(user: User) {
    this.confirmationService.confirm({
      message: `คุณแน่ใจหรือไม่ที่จะลดขั้น <b>${user.firstName}</b> กลับเป็น User ปกติ?`,
      header: 'ยืนยันการลดขั้น (Demote)',
      icon: 'pi pi-arrow-down text-red-500',
      acceptLabel: 'ยืนยันการลดขั้น',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => { this.updateUserRole(user, 'User'); }
    });
  }

  updateUserRole(user: User, newRole: string) {
    user.role = newRole; 
    if (newRole === 'Admin') user.category = 'Admin Management';
    else if (newRole === 'User' || newRole === 'Employee') user.category = 'Internal';
    
    this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: `เปลี่ยนบทบาทเป็น ${newRole} เรียบร้อยแล้ว` });
  }

  // Helper Methods (ของเดิม)
  getRoleSeverity(role: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (role) {
      case 'Super Admin':
      case 'Admin': return 'primary' as any;
      case 'Security': return 'contrast';
      case 'Employee': 
      case 'User': return 'info';
      case 'Hybrid Tech':
      case 'Consultant': return undefined;
      case 'Technician':
      case 'Contractor': return 'warning';
      case 'Messenger': return 'secondary';
      case 'Guest':
      case 'Visitor': return 'success';
      default: return 'secondary';
    }
  }

  getAuthIcon(method: string): string {
    if (!method) return '';
    if (method.includes('Kiosk')) return 'pi pi-desktop text-purple-500';
    if (method.includes('Line OA') || method === 'System' || method.includes('App')) return 'pi pi-mobile text-green-500';
    if (method === 'Face Scan') return 'pi pi-face-smile text-orange-500';
    if (method.includes('ID Exchange') || method.includes('Card')) return 'pi pi-id-card text-blue-500';
    return 'pi pi-envelope text-gray-500';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active': return 'text-green-600 font-bold';
      case 'Checked In': return 'text-blue-600 font-bold';
      case 'Checked Out': return 'text-gray-500';
      case 'Pending': return 'text-orange-500 font-bold';
      case 'Blacklist': return 'text-red-600 font-bold line-through';
      default: return 'text-gray-700';
    }
  }

  isExpired(dateString: string | null): boolean {
    if (!dateString) return false;
    const exp = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return exp < today;
  }

  displayInviteModal: boolean = false;
  inviteEmail: string = '';
  isInviting: boolean = false;
  showInviteModal() {
    this.inviteEmail = '';
    this.displayInviteModal = true;
  }

  async sendInvite() {
    if (!this.inviteEmail || !this.inviteEmail.includes('@')) {
      this.messageService.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'กรุณากรอกอีเมลให้ถูกต้อง' });
      return;
    }

    this.isInviting = true;
    const { data } = await this.supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      this.messageService.add({ severity: 'error', summary: 'หมดอายุ', detail: 'เซสชันของคุณหมดอายุ กรุณาล็อกอินใหม่' });
      this.isInviting = false;
      return;
    }

    this.userManagementService.inviteUser(token, this.inviteEmail).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: `ส่งคำเชิญไปยัง ${this.inviteEmail} เรียบร้อยแล้ว` });
          this.displayInviteModal = false;
          this.loadData(); // โหลดตารางใหม่เผื่อมี User โผล่มาแบบ Pending
        } else {
          this.messageService.add({ severity: 'error', summary: 'ผิดพลาด', detail: res.error });
        }
        this.isInviting = false;
      },
      error: (err) => {
        console.error('Invite Error:', err);
        this.messageService.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'ไม่สามารถส่งคำเชิญได้' });
        this.isInviting = false;
      }
    });
  }
}