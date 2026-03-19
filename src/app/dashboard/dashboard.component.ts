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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { supabase } from '../supabase.config';
import { finalize } from 'rxjs/operators';
import { SiteStateService } from '../service/site/site-state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class DashboardComponent implements OnInit {
  supabase = supabase; // ✅ Add this line to fix TS2304: Cannot find name 'supabase'
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

  // ❌ ลบคำว่า async ออกได้เลย เพราะเราไม่ต้อง await แล้ว
  async ngOnInit() {
    // 1. ติดตามการเปลี่ยน Site จาก Dropdown (ถ้าเปลี่ยนตึก ให้โหลดข้อมูลใหม่)
    this.siteStateService.site$
      .pipe(takeUntil(this.destroy$))
      .subscribe(siteId => {
        if (this.token) {
          this.loadDashboardData(siteId, this.token);
        }
      });

    // 2. ดึง Session ปัจจุบันทันที (กรณีล็อกอินไว้อยู่แล้ว จะได้ไม่ต้องรอ)
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      this.token = data.session.access_token;
      const siteId = this.siteStateService.getCurrentSite();
      if (siteId) {
         this.loadDashboardData(siteId, this.token);
      }
    }

    // 3. 💡 เกราะป้องกันชั้นที่ 2: นั่งรอฟัง Event 
    // กรณีเพิ่งกด Magic Link เข้ามา Supabase จะใช้เวลาเสี้ยววินาทีในการแกะ URL 
    // พอแกะเสร็จมันจะตะโกนบอกตรงนี้ เราก็คว้า Token ไปโหลดกราฟต่อเลย!
    supabase.auth.onAuthStateChange((event, session) => {
      // เช็คว่ามี Session และ Token ไม่ซ้ำกับของเดิม (ป้องกันการเรียกซ้ำซ้อน)
      if (session && this.token !== session.access_token) {
        console.log('✅ Session acquired via Event:', event);
        this.token = session.access_token;
        
        const siteId = this.siteStateService.getCurrentSite();
        if (siteId) {
          this.loadDashboardData(siteId, this.token);
        }
      } else if (event === 'SIGNED_OUT') {
        this.token = null; // เคลียร์ Token ทิ้งถ้ากด Log out
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
    
    const date =
      this.selectedDate
        ? this.selectedDate.toISOString().slice(0, 10)
        : null

    this.dashboardService.getAllActivities(date, siteId, token)
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
            const entityInfo = parsedMeta?.entity ?? null;

            let contextInfo: any = null;

            if (
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

            return {
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
            };
          });
        },
        error: (err: any) => {
          console.error('Failed to load activities', err);
        }
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