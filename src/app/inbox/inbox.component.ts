// app/inbox/inbox.component.ts
import { ParkingEditSidebarComponent } from './inbox-edit-sidebar/parking-edit-sidebar.component';
import { ParkingHistorySidebarComponent } from './inbox-history-sidebar/parking-history-sidebar.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject } from 'rxjs';
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
export class InboxComponent implements OnInit, OnDestroy {
      
  supabase = createClient(
    'https://unxcjdypaxxztywplqdv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA'
  );
  
  sessionToken: string = '';
  originalBuilding: any = null;
  metrics: any[] = [];
  
  buildings: any[] = [];
  selectedBuildings: any[] = [];

  loading: boolean = false;
      
  sidebarEditVisible: boolean = false;
  sidebarHistoryVisible: boolean = false;
  selectedBuilding: any = null;

  historyList: ParkingHistoryItem[] = [];
  historyOffset = 0;
  historyLimit = 5;

  constructor(
    private parkingService: ParkingService,
    private siteState: SiteStateService
  ) { }

  private refreshInterval: any;
  private currentSiteId: string = 'all';
  private destroy$ = new Subject<void>();

  async ngOnInit() {
    this.loading = true;
    const { data } = await this.supabase.auth.getSession();
    const token = data.session?.access_token
    if (!token) {
      console.error('No session');
      this.loading = false;
      return;
    }

    this.sessionToken = token; 
        
    // subscribe site
    this.siteState.site$
      .pipe(takeUntil(this.destroy$))
      .subscribe(site => {
        this.currentSiteId = site;
        this.loadDashboard(site); // ✅ ลบ token ออก
      });

    // auto refresh
    this.refreshInterval = setInterval(() => {
      this.loadDashboard(this.currentSiteId); // ✅ ลบ token ออก
    }, 10000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  async loadDashboard(siteId: string) {
    // ✅ ดึง Token ใหม่เสมอ ป้องกัน 401 Unauthorized
    const { data: { session } } = await this.supabase.auth.getSession();
    const currentToken = session?.access_token;

    if (!currentToken) {
      console.warn('ไม่พบ Session หรือ Token หมดอายุ');
      this.loading = false;
      return;
    }

    this.parkingService.getDashboard(currentToken, siteId)
      .subscribe(res => {
        console.log('📌 ข้อมูลจาก API:', res);

        this.metrics = res.metrics ?? [];
        const summary = res.parking_summary ?? [];

        this.buildings = summary.map((b: any) => ({
          id: b.id,
          name: b.name,
          images: b.images ?? [],
          available: b.total - b.used,
          total: b.total,
          types: b.types ?? [],  
          detail: `เวลาเปิด-ปิด: ${b.open_time} - ${b.close_time}`,
          address: b.address,
          status: b.status,
<<<<<<< HEAD
          price: b.price, // ✅ ใช้ b.price ที่ดึงค่ามาจาก role_price ฝั่ง Backend
=======
          // ✅ เปลี่ยนตรงนี้
          priceText: b.price_text,
>>>>>>> dbd0f50087c78e0b5a10772cf76295b3d8884fea
          rate: b.rate,
          openTime: b.open_time,
          closeTime: b.close_time
        }));
        
        this.loading = false;
      }, err => {
        console.error('API Error:', err);
        this.loading = false;
      });
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
          this.originalBuilding = JSON.parse(JSON.stringify(res.data));
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
<<<<<<< HEAD
      role_price: formData.hourlyRate, // ✅ แก้เป็น role_price เผื่อไว้ (ขึ้นอยู่กับฝั่ง Backend รับค่าอะไร)
=======
>>>>>>> dbd0f50087c78e0b5a10772cf76295b3d8884fea
      is_active: formData.isActive,
      images: formData.images ?? [],
      // ✅ เพิ่ม role_prices เข้าไป
      role_prices: formData.role_prices
    };

    const originalBuilding = {
      name: this.originalBuilding.name,
      address: this.originalBuilding.address,
      open_time: this.originalBuilding.openTime,
      close_time: this.originalBuilding.closeTime,
<<<<<<< HEAD
      role_price: this.originalBuilding.hourlyRate, // ✅ สอดคล้องกับด้านบน
=======
>>>>>>> dbd0f50087c78e0b5a10772cf76295b3d8884fea
      is_active: this.originalBuilding.isActive,
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

    if (entities.length === 0) {
      this.sidebarEditVisible = false;
      return;
    }

    this.parkingService
      .updateEntities(entities, token)
      .subscribe({
        next: () => {
          this.sidebarEditVisible = false;
          this.loadDashboard(this.currentSiteId); // ✅ ลบ token ออก
        },
        error: (err) => {
          console.error('Update failed:', err);
          console.error(err.error);   
        }
      });
  }
  
  getChangedFields(original: any, edited: any) {
    const changes: any = {};

    Object.keys(edited).forEach(key => {
      const originalValue = original[key];
      const editedValue = edited[key];

<<<<<<< HEAD
=======
      // Compare array
>>>>>>> dbd0f50087c78e0b5a10772cf76295b3d8884fea
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