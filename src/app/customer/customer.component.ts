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

import { UserManagementService, UserManagementResponse } from '../service/user-management.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  category: 'Internal' | 'External' | 'Hybrid' | '';
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
    CommonModule,
    FormsModule,
    HttpClientModule,
    TableModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    AvatarModule,
    TagModule,
    TooltipModule,
    BadgeModule,
    ProgressSpinnerModule
  ],
  templateUrl: './customer.component.html',
  styles: [`
    /* Custom scrollbar for mobile sidebar tabs */
    .overflow-x-auto::-webkit-scrollbar {
      display: none;
    }
    .overflow-x-auto {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
  providers: [UserManagementService]
})
export class CustomerComponent implements OnInit {

  // State
  selectedCategory: string = 'All';
  selectedUsers: User[] = [];
  selectedDate: Date | undefined;

  // Supabase Client
  supabase: SupabaseClient = createClient(
    'https://unxcjdypaxxztywplqdv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA'
  );

  // Metrics
  metrics: { title: string, value: string, subtext: string, icon: string }[] = [];

  // Options
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

  // Data
  allUsers: User[] = [];
  loading: boolean = false;

  constructor(private userManagementService: UserManagementService) { }

  async ngOnInit() {
    this.loading = true; // Start loading

    // Authenticate (using hardcoded credentials as per existing Dashboard pattern)
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
        // Map Metrics
        if (response.metrics) {
          this.metrics = response.metrics.map(m => {
            let icon = 'pi pi-info-circle';
            if (m.title.includes('ทั้งหมด')) icon = 'pi pi-users';
            else if (m.title.includes('ผู้ดูแลระบบ') || m.title.includes('Admin')) icon = 'pi pi-shield';
            else if (m.title.includes('ทั่วไป') || m.title.includes('User')) icon = 'pi pi-user';

            return {
              title: m.title,
              value: m.value,
              subtext: m.subtext,
              icon: icon
            };
          });
        }

        // Map Users
        if (response.profiles) {
          this.allUsers = response.profiles.map(p => ({
            id: p.id,
            firstName: p.name, // Use full name as firstName
            lastName: '',
            phone: p.phone || '',
            email: p.email || '',
            company: '', // Leave blank
            category: '' as any, // Leave blank
            role: p.role || '',
            authMethod: '', // Leave blank
            status: '', // Leave blank
            lastActive: '', // Leave blank
            registerDate: p.joined_date || p.created_at || '',
            expiryDate: null,
            avatarUrl: p.avatar
          }));
        }
        this.loading = false; // Stop loading
      },
      error: (err: any) => {
        console.error('Error fetching user profiles:', err);
        this.loading = false; // Stop loading
      }
    });
  }

  // Filter Logic
  get filteredUsers() {
    if (this.selectedCategory === 'All') return this.allUsers;
    return this.allUsers.filter(user => user.category === this.selectedCategory);
  }

  setCategory(category: string) {
    this.selectedCategory = category;
  }

  getCount(category: string): number {
    if (category === 'All') return this.allUsers.length;
    return this.allUsers.filter(u => u.category === category).length;
  }

  // Helper: Role Color
  getRoleSeverity(role: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (role) {
      case 'Super Admin':
      case 'Admin': return 'primary' as any;
      case 'Security': return 'contrast';
      case 'Employee': return 'info';
      case 'User': return 'info';

      // Hybrid Roles: Return undefined to use custom CSS
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

  // Helper: Auth Icon
  getAuthIcon(method: string): string {
    if (!method) return '';
    if (method.includes('Kiosk')) return 'pi pi-desktop';
    if (method.includes('Line OA') || method === 'System' || method.includes('App')) return 'pi pi-mobile';
    if (method === 'Face Scan') return 'pi pi-face-smile';
    if (method.includes('ID Exchange') || method.includes('Card')) return 'pi pi-id-card';
    return 'pi pi-cog';
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
}