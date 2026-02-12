// app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// ✅ Fix Imports: Ensure these point to the files created above
import { DashboardService } from '../service/dashboard.service';
import { ActivityLog, Metric } from '../models/dashboard.model';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AvatarModule } from 'primeng/avatar';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { TimelineModule } from 'primeng/timeline';
import { createClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule,
    ButtonModule, InputTextModule, DropdownModule,
    CalendarModule, TableModule, TagModule, CheckboxModule, CardModule,
    IconFieldModule, InputIconModule, AvatarModule, TabViewModule, BadgeModule,
    SidebarModule, TooltipModule, TimelineModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  // ✅ Provider is optional here if providedIn: 'root' is in service, 
  // but keeping it here is fine too.
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit {
  supabase = createClient(
    'https://unxcjdypaxxztywplqdv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA'
  );

  metrics: Metric[] = [];
  allActivities: ActivityLog[] = [];

  selectedLogs: any[] = [];
  selectedDate: Date | undefined;
  historyVisible: boolean = false;
  selectedUserHistory: ActivityLog[] = [];
  currentUser: string = '';

  // ✅ DashboardService will now be found because the file exists
  constructor(private dashboardService: DashboardService) { }

  async ngOnInit() {
    await this.supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: '12345678'
    });

    this.loadDashboardData();
  }


  async loadDashboardData() {
    // ✅ Fix TS7006: Add explicit types (Metric[]) to data and (any) to error
    /*this.dashboardService.getDashboardMetrics().subscribe({
      next: (data: Metric[]) => this.metrics = data,
      error: (err: any) => console.error('Failed to load metrics', err)
    });*/

    const { data } = await this.supabase.auth.getSession();

    const token = data.session?.access_token;

    if (!token) {
      console.error('No session token');
      return;
    }
    // default = วันนี้
    const date =
      this.selectedDate
        ? this.selectedDate.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    this.dashboardService.getAllActivities(date, token).subscribe({
      next: (res: any) => {
        this.metrics = res.metrics;
        this.allActivities = res.activities;
      },
      error: (err: any) => console.error('Failed to load activities', err)
    });
  }

  get normalActivities() {
    return this.allActivities.filter(a => a.category === 'normal');
  }

  get abnormalActivities() {
    return this.allActivities.filter(a => a.category === 'abnormal');
  }

  viewUserHistory(userName: string) {
    this.currentUser = userName;
    this.selectedUserHistory = this.allActivities.filter(a => a.user === userName);
    this.historyVisible = true;
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'Check-in': return 'pi pi-id-card';
      case 'Reservation': return 'pi pi-calendar-plus';
      case 'User Mgmt': return 'pi pi-user-edit';
      case 'Security': return 'pi pi-lock';
      case 'Login': return 'pi pi-desktop';
      case 'System': return 'pi pi-cog';
      case 'Access': return 'pi pi-ban';
      default: return 'pi pi-info-circle';
    }
  }

  getStatusSeverity(status: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'denied': return 'danger';
      case 'error': return 'danger';
      default: return 'info';
    }
  }

  getActivitySeverity(category: string): "success" | "danger" | "info" | "warning" | "secondary" | "contrast" | undefined {
    return category === 'normal' ? 'success' : 'danger';
  }
}