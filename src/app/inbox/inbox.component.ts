// app/inbox/inbox.component.ts
import { ParkingEditSidebarComponent } from './inbox-edit-sidebar/parking-edit-sidebar.component';
import { ParkingHistorySidebarComponent } from './inbox-history-sidebar/parking-history-sidebar.component';
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
import { ParkingHistoryItem } from '../models/parking-history.model';
import { SiteStateService } from '../service/site/site-state.service';
import { Subject, timeout, catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
    
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
    ParkingEditSidebarComponent,
    ParkingHistorySidebarComponent,
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
      

  supabase = createClient(
    'https://unxcjdypaxxztywplqdv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA'
  );
  sessionToken: string = '';
  originalBuilding: any = null;
  metrics: any[] = [];
  buildings: any[] = [];

  // ฟิลเตอร์โหมด (เริ่มต้นเป็นรายการที่จอดรถ)
  selectedMode: 'parking' | 'visitor' = 'parking';
  modeOptions = [
    { label: 'รายการที่จอดรถ', value: 'parking' },
    { label: 'รายการอาคารผู้เยี่ยมชม', value: 'visitor' }
  ];

  selectedBuildings: any[] = [];
  loading: boolean = false;
      
  sidebarEditVisible: boolean = false;       // ✅ ADD
  sidebarHistoryVisible: boolean = false;
  selectedBuilding: any = null;          // ✅ ADD

  historyList: ParkingHistoryItem[] = [];
  historyOffset = 0;
  historyLimit = 5;
  errorMessage: string | null = null;
      

  constructor(
    private parkingService: ParkingService,
    private siteState: SiteStateService
  ) { }

  private refreshInterval: any;
  private currentSiteId: string = 'all';
  private destroy$ = new Subject<void>();
  async ngOnInit() {
    this.loading = true; // Start loading
    const { data } = await this.supabase.auth.getSession();
    const token = data.session?.access_token
    if (!token) {
      console.error('No session');
      return;
    }

    this.sessionToken = token; // ✅ เก็บไว
        
    // subscribe site
    this.siteState.site$
      .pipe(takeUntil(this.destroy$))
      .subscribe(site => {
        this.currentSiteId = site;
        this.loadDashboard(token, site);
      });

    // auto refresh
    this.refreshInterval = setInterval(() => {
      if (!this.errorMessage) {
        this.loadDashboard(token, this.currentSiteId);
      }
    }, 10000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }


  async loadDashboard(token: string, siteId: string) {

    this.parkingService.getDashboard(token, siteId)
      .pipe(
        timeout(10000), // ⛔ กัน hang
        catchError((err) => {

          console.error(err);

          if (err.name === 'TimeoutError') {
            this.errorMessage = '⏱️ เซิร์ฟเวอร์ตอบช้าเกินไป';
          } else if (!navigator.onLine) {
            this.errorMessage = '🌐 ไม่มีอินเทอร์เน็ต';
          } else {
            this.errorMessage = '⚠️ โหลดข้อมูลไม่สำเร็จ';
          }

          this.loading = false;

          return of(null); // ❗ สำคัญ
        })
      )
      .subscribe(res => {
        if (!res) return;
        console.log(res);
        
        this.errorMessage = null; // ✅ clear เฉพาะ success

        this.metrics = res.metrics ?? [];

        const summary = res.parking_summary ?? [];

        this.buildings = summary.map((b: any) => ({
          id: b.id,
          name: b.name,
          images: b.images ?? [],
          available: b.total - b.used,
          total: b.total,
          types: b.types ?? [],  // ประเภท
          detail: `เวลาเปิด-ปิด: ${b.open_time} - ${b.close_time}`,
          address: b.address,
          status: b.status,
          // ✅ เปลี่ยนตรงนี้
          priceText: b.price_text,
          rate: b.rate,
          openTime: b.open_time,
          closeTime: b.close_time
        }));

        // ไม่เพิ่มอาคารผู้เยี่ยมชมแบบ static เพื่อใช้ data จาก backend ตามจริง
        this.loading = false; // Stop loading
      }, err => {
        console.error(err);
        this.loading = false;
      });
  }

  get filteredBuildings() {
    if (this.selectedMode === 'visitor') {
      return this.buildings.filter(b => b.name?.trim() === 'อาคาร 12 ชั้น (ตึกโหล)');
    }
    return this.buildings.filter(b => b.name?.trim() !== 'อาคาร 12 ชั้น (ตึกโหล)');
  }

  get parkingLocationsCount() {
    return this.buildings.filter(b => b.name?.trim() !== 'อาคาร 12 ชั้น (ตึกโหล)').length;
  }

  get visitorLocationsCount() {
    return this.buildings.filter(b => b.name?.trim() === 'อาคาร 12 ชั้น (ตึกโหล)').length;
  }

  get totalLocationsCount() {
    return this.buildings.length;
  }
  
  retry() {
    this.errorMessage = null;
    this.loading = true;

    this.loadDashboard(this.sessionToken, this.currentSiteId);
  }

  async openEdit(building: any) { 
    this.sidebarEditVisible = true;
    this.loading = true;
    this.selectedBuilding = null;

    const {data: { session }} = await this.supabase.auth.getSession();
    const token = session?.access_token;

    this.parkingService
      .getBuildingById(building.id, token!)
      .subscribe({
        next: (res: any) => { 
          this.selectedBuilding = res.data; 
          this.originalBuilding = JSON.parse(JSON.stringify(res.data)); // clone กัน reference
          this.loading = false; 
        },
        error: (err) => { 
          console.error('Error fetching building:', err); 
          this.loading = false; 
        }    
      }); 
  }

  openHistory(building: any) {
    this.selectedBuilding = building;
    this.sidebarHistoryVisible = true;

    this.historyOffset = 0;
    this.historyLimit = 5;
    this.historyList = [];

    this.loadHistory();
  }
  loadHistory(loadMore = false) {

    if (!this.selectedBuilding) return;

    this.loading = true;

    if (loadMore) {
      this.historyLimit = 10;
    } else {
      this.historyLimit = 5;
      this.historyOffset = 0;
    }

    this.parkingService
      .getBuildingHistory(
        this.selectedBuilding.id,
        this.historyLimit,
        this.historyOffset,
        this.sessionToken
      )
      .subscribe({
        next: (res) => {

          const mapped = res.data.map((item: any) => ({
            id: item.id,
            logType: item.log_type,
            entityType: item.entity_type,
            entityId: item.entity_id,
            field: item.field,
            oldValue: item.old_value,
            newValue: item.new_value,
            action: item.action,
            updatedBy: item.user_name,
            updatedAt: item.created_at
          }));

          if (loadMore) {
            this.historyList = [...this.historyList, ...mapped];
            this.historyOffset += 10;
          } else {
            this.historyList = mapped;
            this.historyOffset = 5;
          }

          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  private addEntityIfChanged(
    entities: any[],
    entityType: string,
    entityId: string,
    original: any,
    edited: any
  ) {
    const changes = this.getChangedFields(original, edited)
    if (Object.keys(changes).length > 0) {
      entities.push({
        entity_type: entityType,
        entity_id: entityId,
        updates: changes
      });
    }
  }

  async handleSave(formData: any) {

    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;
    if (!token|| !this.originalBuilding) return;

    // 🔹 map form -> db column
    const editedBuilding  = {
      name: formData.name,
      address: formData.address,
      open_time: formData.openTime,
      close_time: formData.closeTime,
      is_active: formData.isActive,
      images: formData.images ?? [], // เก็บ URL รูปภาพ
      // ✅ เพิ่ม role_prices เข้าไป
      role_prices: formData.role_prices
    };

    const originalBuilding = {
      name: this.originalBuilding.name,
      address: this.originalBuilding.address,
      open_time: this.originalBuilding.open_time || this.originalBuilding.openTime,
      close_time: this.originalBuilding.close_time || this.originalBuilding.closeTime,
      is_active: this.originalBuilding.is_active ?? this.originalBuilding.isActive,
      images: this.originalBuilding.images ?? [],
      // ✅ ดึงจากก้อนต้นฉบับที่เก็บไว้ตอน openEdit
      role_prices: this.originalBuilding.role_prices
    };
        
    const entities: any[] = [];

    this.addEntityIfChanged(
      entities,
      'buildings',
      formData.id,
      originalBuilding,
      editedBuilding
    );

    // 🔥 ถ้าไม่มีอะไรเปลี่ยน ไม่ต้องยิง API
    if (entities.length === 0) {
      this.sidebarEditVisible = false;
      return;
    }

    this.loading = true; // แสดง loading ขณะบันทึก
    this.parkingService
      .updateEntities(entities, token)
      .subscribe({
        next: () => {
          this.sidebarEditVisible = false;
          this.loadDashboard(token, this.currentSiteId);
        },
        error: (err) => {
          this.loading = false;
          console.error('Update failed:', err);
          console.error(err.error);   // 👈 เพิ่มบรรทัดนี้
        }
      });
  }
  getChangedFields(original: any, edited: any) {
    const changes: any = {};

    Object.keys(edited).forEach(key => {
          
      const originalValue = original[key];
      const editedValue = edited[key];

      // Compare array
      if (Array.isArray(originalValue) && Array.isArray(editedValue)) {
        if (JSON.stringify(originalValue.sort()) !== JSON.stringify(editedValue.sort())) {
          changes[key] = editedValue;
        }
        return;
      }
       
      // Compare Object / JSONB
      if (typeof originalValue === 'object' && originalValue !== null && 
          typeof editedValue === 'object' && editedValue !== null) {
        if (JSON.stringify(originalValue) !== JSON.stringify(editedValue)) {
          changes[key] = editedValue;
        }
        return;
      }
      if (edited[key] !== original[key]) {
        changes[key] = edited[key];
      }
    });

    return changes;
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