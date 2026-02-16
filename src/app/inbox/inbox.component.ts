// app/inbox/inbox.component.ts
import { ParkingEditSidebarComponent } from './inbox-sidebar/parking-edit-sidebar.component';
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
    ParkingEditSidebarComponent,
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
  
  originalBuilding: any = null;
  metrics: any[] = [];
  buildings: any[] = [];

  selectedBuildings: any[] = [];
  loading: boolean = false;
  
  sidebarVisible: boolean = false;       // ✅ ADD
  selectedBuilding: any = null;          // ✅ ADD

  constructor(private parkingService: ParkingService) { }

  async ngOnInit() {
    this.loading = true; // Start loading
    await this.supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: '12345678'
    });
    this.loadDashboard();
    setInterval(() => {
      this.loadDashboard();
    }, 10000); // refresh ทุก 1 นาที
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
        id: b.id,
        name: b.name,
        available: b.total - b.used,
        total: b.total,
        types: b.types ?? [],  // ประเภท
        detail: `เวลาเปิด-ปิด: ${b.open_time} - ${b.close_time}`,
        address: b.address,
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

  async openEdit(building: any) { 

    this.sidebarVisible = true;
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

  private addEntityIfChanged(
    entities: any[],
    entityType: string,
    entityId: string,
    original: any,
    edited: any
  ) {
    const changes = this.getChangedFields(original, edited);

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
      price_value: formData.hourlyRate,
      is_active: formData.isActive,
    };

    const originalBuilding = {
      name: this.originalBuilding.name,
      address: this.originalBuilding.address,
      open_time: this.originalBuilding.openTime,
      close_time: this.originalBuilding.closeTime,
      price_value: this.originalBuilding.hourlyRate,
      is_active: this.originalBuilding.isActive,
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
      this.sidebarVisible = false;
      return;
    }


    this.parkingService
      .updateEntities(entities, token)
      .subscribe({
        next: () => {
          this.sidebarVisible = false;
          this.loadDashboard();
        },
        error: (err) => {
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

      // compare array
      if (Array.isArray(originalValue) && Array.isArray(editedValue)) {
        if (JSON.stringify(originalValue.sort()) !== JSON.stringify(editedValue.sort())) {
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