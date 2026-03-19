// app/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// ✅ Fix Imports: Ensure these point to the files created above
import { DashboardService } from '../service/dashboard.service';
import { ActivityLog, Metric,LogDisplay } from '../models/dashboard.model';

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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { createClient } from '@supabase/supabase-js';
import { finalize } from 'rxjs/operators';
import { SiteStateService } from '../service/site/site-state.service';
import { timer, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule,
    ButtonModule, InputTextModule, DropdownModule,
    CalendarModule, TableModule, TagModule, CheckboxModule, CardModule,
    IconFieldModule, InputIconModule, AvatarModule, TabViewModule, BadgeModule,
    SidebarModule, TooltipModule, TimelineModule, ProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  // ✅ Provider is optional here if providedIn: 'root' is in service, 
  // but keeping it here is fine too.
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit, OnDestroy {
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
  loading: boolean = false; // Add loading state

  // ✅ DashboardService will now be found because the file exists
  constructor(
    private dashboardService: DashboardService,
    private siteStateService: SiteStateService,
  ) { }

  private token: string | null = null;



  get selectedSite(): string {
    return this.siteStateService.getCurrentSite();
  }

  private destroy$ = new Subject<void>();

  async ngOnInit() {
    const { data } = await this.supabase.auth.getSession();
    this.token = data.session?.access_token ?? null;

    if (!this.token) {
      console.error('No session');
      return;
    }

    this.siteStateService.site$
      .pipe(takeUntil(this.destroy$))
      .subscribe(siteId => {
        if (this.token) {
          this.loadDashboardData(siteId, this.token);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  async loadDashboardData(siteId: string, token: string) {
    // ✅ Fix TS7006: Add explicit types (Metric[]) to data and (any) to error
    /*this.dashboardService.getDashboardMetrics().subscribe({
      next: (data: Metric[]) => this.metrics = data,
      error: (err: any) => console.error('Failed to load metrics', err)
    });*/

    this.loading = true; // Start loading
    // default = วันนี้
    
    // แก้ไขจุดที่ 2: ปรับการส่ง format วันที่ ไม่ใช้ toISOString() เพราะมันเป็น UTC
    let dateStr: string | null = null;
    if (this.selectedDate) {
      const year = this.selectedDate.getFullYear();
      const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectedDate.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    this.dashboardService.getAllActivities(dateStr, siteId, token)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res: any) => {
          this.metrics = res.metrics;
          this.allActivities = res.activities.map((a: any) => {

            // ===== parse revision snapshot =====
            let revisionRows: any[] = [];
            let parsedOld: any = null;
            let parsedNew: any = null;

            if (a.log_type === 'revision') {
              try {
                parsedOld = a.old_data
                  ? (typeof a.old_data === 'string' ? JSON.parse(a.old_data) : a.old_data)
                  : null;

                parsedNew = a.new_data
                  ? (typeof a.new_data === 'string' ? JSON.parse(a.new_data) : a.new_data)
                  : null;

                // ✅ ถ้ามี snapshot เต็ม
                if (parsedOld && parsedNew) {
                  const allKeys = new Set([
                    ...Object.keys(parsedOld),
                    ...Object.keys(parsedNew)
                  ]);

                  revisionRows = Array.from(allKeys).map(key => {
                    const oldVal = parsedOld?.[key] ?? null;
                    const newVal = parsedNew?.[key] ?? null;

                    return {
                      field: key,
                      old: oldVal,
                      new: newVal,
                      changed: JSON.stringify(oldVal) !== JSON.stringify(newVal)
                    };
                  });
                }

                // ⚠ fallback ช่วงเปลี่ยนผ่าน (old/new ยัง null)
                else if (a.changes) {
                  const changesObj = typeof a.changes === 'string'
                    ? JSON.parse(a.changes)
                    : a.changes;

                  revisionRows = Object.keys(changesObj).map(key => ({
                    field: key,
                    old: changesObj[key]?.old,
                    new: changesObj[key]?.new,
                    changed: true
                  }));
                }

              } catch (err) {
                console.error('Invalid revision JSON:', err);
              }
            }

            let parsedChanges = null;
            if (a.changes) {
              try {
                parsedChanges = typeof a.changes === 'string'
                  ? JSON.parse(a.changes)
                  : a.changes;
              } catch (err) {
                console.error('Invalid changes JSON:', a.changes);
              }
            }


            let parsedNewData = null;
            if (a.new_data) {
              try {
                parsedNewData = typeof a.new_data === 'string'
                  ? JSON.parse(a.new_data)
                  : a.new_data;
              } catch (err) {
                console.error('Invalid new_data JSON:', a.new_data);
              }
            }

            // ===== parse meta =====
            let parsedMeta = null;

            if (a.meta) {
              try {
                parsedMeta = typeof a.meta === 'string'
                  ? JSON.parse(a.meta)
                  : a.meta;
              } catch (err) {
                console.error('Invalid meta JSON:', a.meta);
                parsedMeta = null;
              }
            }
            let entityInfo = parsedMeta?.entity ?? null;

            // ✅ fallback สำหรับ reservation
            if (!entityInfo && a.entity_type === 'reservation') {
              entityInfo = parsedNewData || parsedChanges || null;
            }

            let contextInfo: any = null;

            if (parsedMeta?.context) {
              contextInfo = parsedMeta.context;
            }
            else if (parsedNewData?.booking_type) {
              contextInfo = {
                booking_type: parsedNewData.booking_type
              };
            }
            else if (
              parsedMeta?.location ||
              parsedMeta?.device ||
              parsedMeta?.method ||
              parsedMeta?.verification
            ) {
              contextInfo = {
                location: parsedMeta?.location,
                device: parsedMeta?.device,
                method: parsedMeta?.method,
                verification: parsedMeta?.verification
              };
            }

            const resultInfo = {
              status: a.status,
              by: a.user_name,
              time: a.time
            };

            const mappedLog = {
              id: a.id,
              time: a.time,
              type: a.entity_type || a.action,
              action: a.action,
              category: a.category,
              status: a.status,
              logType: a.log_type,
              user: a.user_name,
              entityId: a.entity_id,
              entityType: a.entity_type,
              detail: a.detail,
              revisionRows, // ตัวแปรที่คุณ Parse ไว้
              meta: parsedMeta, // ตัวแปรที่คุณ Parse ไว้
              schedule: parsedNewData,
              changes: parsedChanges
            } as ActivityLog;

            // 🌟 ทำการ "ย่อยข้อมูล" ก่อนส่งให้ HTML ทันที
            mappedLog.logDisplay = this.transformLogForDisplay(mappedLog);

            return mappedLog;
            /*{
              id: a.id,
              time: a.time,
              type: a.entity_type || a.action,
              action: a.action,
              category: a.category,
              status: a.status,

              logType: a.log_type,
              user: a.user_name,

              entityId: a.entity_id,
              entityType: a.entity_type,

              entityInfo,
              contextInfo,
              resultInfo,

              detail: a.detail,
              revisionRows,
              meta: parsedMeta,
              schedule: parsedNewData,
              changes: parsedChanges   // ✅ ADD THIS
            };*/
          });
        },
        error: (err: any) => {
          console.error('Failed to load activities', err);
        }
      });
  }

  // ==========================================
  // 🌟 THE TRANSFORMER: ฟังก์ชันย่อยข้อมูลสำหรับ UI
  // ==========================================
  private transformLogForDisplay(log: ActivityLog): LogDisplay {
    const d: LogDisplay = {
      title: this.formatAction(log.action),
      subtitle: this.formatEntity(log.entityType),
      icon: this.getActivityIcon(log.type),
      attributes: [],
      contexts: [],
      hasChanges: log.logType === 'revision' && !!log.revisionRows?.length
    };

    const entity = log.meta?.entity || {};
    const context = log.meta?.context || {};

    // 1. จัดการ Attributes หลัก (จาก meta.entity)
    Object.keys(entity).forEach(key => {
      // ข้ามบาง key ที่ซ้ำซ้อน
      if (key === 'type' && log.entityType !== 'slots') return; 
      
      let val = entity[key];
      let color = '';

      // ตกแต่งสีให้ Status
      if (['status', 'status_to', 'current_status', 'set_status'].includes(key)) {
        color = this.getTextColorForStatus(val);
        val = String(val).toUpperCase().replace(/_/g, ' ');
      }
      
      // ตกแต่งสีให้ Action Label
      if (key === 'action_label') {
        val = String(val).replace(/_/g, ' ');
        color = val.includes('REMOVE') ? 'text-red-600 font-bold' : 'text-green-600 font-bold';
      }

      d.attributes.push({ label: this.formatLabel(key), value: val, color });
    });

    // 2. จัดการ Context (จาก meta.context)
    Object.keys(context).forEach(key => {
      let val = context[key];
      // ทำให้เวลาอ่านง่ายขึ้น (ถ้าเป็น ISO String)
      if (typeof val === 'string' && val.includes('T') && val.includes('+00:00')) {
        const date = new Date(val);
        val = date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      }
      d.contexts.push({ label: this.formatLabel(key), value: val });
    });

    // 3. Fallback เผื่อไม่มี Meta
    if (d.attributes.length === 0 && log.detail) {
      d.attributes.push({ label: 'Detail', value: log.detail, color: '' });
    }

    return d;
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
      case 'vehicle': return 'pi pi-car';
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

  // Helper แปลง Key เป็นคำสวยๆ
  private formatLabel(key: string): string {
    const customLabels: Record<string, string> = {
      plate: 'Plate', slot: 'Slot ID', floor: 'Floor', vehicle_type: 'Vehicle Type',
      status_to: 'New Status', status_from: 'Previous', status: 'Status',
      start_time: 'Start Time', end_time: 'End Time', booking_type: 'Booking Type',
      color: 'Color', model: 'Model', province: 'Province', action_label: 'Action',
      current_status: 'Current Status', reason: 'Reason', duration: 'Duration',
      target_date: 'Target Date', period: 'Period', set_status: 'Set Status'
    };
    if (customLabels[key]) return customLabels[key];
    
    // ถ้าไม่มีใน List ให้ตัด Underscore แล้วทำเป็น Title Case
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private getTextColorForStatus(status: string): string {
    if (!status) return '';
    const s = String(status).toLowerCase();
    if (s.includes('success') || s.includes('confirm') || s.includes('available')) return 'text-green-600 font-bold';
    if (s.includes('cancel') || s.includes('delete') || s.includes('remove') || s.includes('denied')) return 'text-red-600 font-bold';
    if (s.includes('maintenance') || s.includes('pending')) return 'text-orange-600 font-bold';
    return 'text-blue-600 font-bold';
  }
  formatAction(action?: string): string {
    if (!action) return '';

    const actionMap: Record<string, string> = {
      vehicle_delete: 'Vehicle Deleted',
      vehicle_create: 'Vehicle Created',
      vehicle_update: 'Vehicle Updated',

      slot_override_available: 'Slot Availability Override',
      slot_override_block: 'Slot Blocked',

      reservation_create: 'Reservation Created',
      reservation_cancel: 'Reservation Cancelled',

      login_success: 'User Login',
      login_failed: 'Login Failed'
    };

    if (actionMap[action]) {
      return actionMap[action];
    }

    // fallback auto format
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  formatEntity(type?: string): string {
    if (!type) return 'Entity';

    const map: Record<string, string> = {
      vehicle: 'Vehicle',
      cars: 'Vehicle',
      reservation: 'Reservation',
      slot: 'Parking Slot',
      user: 'User'
    };

    return map[type] || type;
}

  onDateChange() {
    const siteId = this.siteStateService.getCurrentSite();
    if (this.token) {
      this.loadDashboardData(siteId, this.token);
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