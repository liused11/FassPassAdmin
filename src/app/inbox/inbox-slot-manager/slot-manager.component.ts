// slot-manager.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';
import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { ParkingService } from '../../service/inbox-parking.service';
import { SlotDetailComponent } from '../inbox-slot-detail/slot-detail.component';
import { SlotStatus } from '../../models/slot-status.model';


interface Slot {
  id: string;
  name: string;
  status: SlotStatus;        // base status (DB)
  current_status: SlotStatus; // computed
  selected?: boolean;
}
interface Zone {
  id: string;
  name: string;
  floorId: string;
  slots: Slot[];
}

interface Floor {
  id: string;
  floor: string;     // เช่น 1-1-1
  zones: Zone[];
}

@Component({
  selector: 'app-slot-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SlotDetailComponent
],
  templateUrl: './slot-manager.component.html',
  styleUrls: ['./slot-manager.component.css']
})
export class SlotManagerComponent implements OnChanges {

  @Input() buildingId?: string;
  @Input() visible!: boolean;
  @Input() token?: string;


  floors: Floor[] = [];
  selectedFloor!: Floor;

  searchText = '';
  showDialog = false;
  isUpdating = false;

  showSidebar = false;
  refreshInterval: ReturnType<typeof setInterval> | null = null;
  selectedSlotIds = new Set<string>();

  constructor(
    private parkingService: ParkingService,
  ) {
    
    // this.generateMockData();
    //this.selectedFloor = this.floors[0];
  }

  /*generateMockData() {
    for (let f = 1; f <= 5; f++) {
      const zones: Zone[] = ['A', 'B', 'C', 'D'].map(zone => ({
        name: zone,
        slots: Array.from({ length: 8 }).map((_, i) => ({
          id: `${zone}${i + 1}`,
          status: this.randomStatus()
        }))
      }));

      this.floors.push({ floor: f, zones });
    }
  }*/
  ngOnChanges(changes: SimpleChanges) {

    if (this.visible && this.buildingId && this.token) {

      this.loadSlots();

      if (!this.refreshInterval) {
        this.refreshInterval = setInterval(() => {
          this.loadSlots();
        }, 1000);
      }

    }

    if (!this.visible && this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

  }
  
  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
  async loadSlots() {
    if (this.showSidebar) return;
    if (!this.buildingId || !this.token) return;


    this.parkingService
        .getBuildingSlotsStatus(this.buildingId, this.token)
        .subscribe({
        next: (res) => {
            if (!res.success) return;

            const prevFloorId = this.selectedFloor?.id;
            this.floors = this.transformApiData(res.data);

            if (prevFloorId) {
              const found = this.floors.find(f => f.id === prevFloorId);
              if (found) {
                this.selectedFloor = found;
                return;
              }
            }
            
            if (this.floors.length) {
              this.selectedFloor = this.floors[0];
            }
        },
        error: (err) => {
            console.error('Load slots failed', err);
        }
        });
    }
  transformApiData(apiData: any[]): Floor[] {
    return apiData.map(floor => ({
        id: floor.id,
        floor: floor.level_order, // ใช้ level_order แทน
        zones: floor.zones.map((zone: any) => ({
        id: zone.id,
        name: zone.name.replace('Zone ', ''),
        floorId: floor.id,
        slots: zone.slots.map((slot: any) => ({
            id: slot.id,
            name: slot.name,
            status: slot.status,             // DB
            current_status: slot.current_status ?? slot.status,
            selected: this.selectedSlotIds.has(slot.id)
        }))
        }))
    }));
  }

  randomStatus(): SlotStatus {
    const statuses: SlotStatus[] = ['available', 'occupied', 'reserved', 'maintenance' ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  selectFloor(floor: Floor) {
    this.clearSelection();
    this.selectedFloor = floor;
    this.searchText = '';
  }
  clearSelection() {
    this.selectedSlotIds.clear();

    this.floors.forEach(f =>
      f.zones.forEach(z =>
        z.slots.forEach(s => s.selected = false)
      )
    );
  }

  toggleSlot(slot: Slot) {
    if (slot.current_status === 'occupied' || slot.current_status === 'reserved'){
      return;
    }

    if (this.selectedSlotIds.has(slot.id)) {
      this.selectedSlotIds.delete(slot.id);
      slot.selected = false;
    } else {
      this.selectedSlotIds.add(slot.id);
      slot.selected = true;
    }
  }
  get selectedSlots(): Slot[] {
    if (!this.selectedFloor) return [];

    return this.selectedFloor.zones
      .flatMap(z => z.slots)
      .filter(slot => this.selectedSlotIds.has(slot.id));
  }

  openDialog() {
    if (this.selectedSlots.length === 0) return;
    //this.showDialog = true;
    this.showSidebar = true;
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  handleUpdated(newStatus: SlotStatus) {
    /*this.selectedSlots.forEach(slot => {
      slot.status = newStatus;
      slot.selected = false;
    });*/

    this.showSidebar = false;
    this.clearSelection();
    this.loadSlots(); 
  }

  updateStatus(newStatus: SlotStatus) {
    if (!this.token || this.isUpdating) return;

    const selected = this.selectedSlots;
    if (selected.length === 0) return;

    this.isUpdating = true;

    const entities = selected.map(slot => ({
        entity_type: 'slots',
        entity_id: slot.id,
        updates: {
        status: newStatus
        }
    }));

    this.parkingService.updateEntities(entities, this.token)
        .subscribe({
        next: () => {
            selected.forEach(slot => {
            slot.status = newStatus;
            slot.selected = false;
            });

            this.showDialog = false;
            this.isUpdating = false;
        },
        error: (err) => {
            console.error('Slot status update failed:', err);
            console.log('Status:', err.status);
            console.log('Body:', err.error);

            this.isUpdating = false;
        }
        });
  }

  get totalSlots(): number {
    return this.selectedFloor.zones
      .flatMap(z => z.slots).length;
  }

  get filteredZones(): Zone[] {
    if (!this.selectedFloor) return [];

    const keyword = this.searchText.toLowerCase();

    return this.selectedFloor.zones
        .map(zone => ({
        ...zone,
        slots: zone.slots.filter(slot =>
            slot.name.toLowerCase().includes(keyword)
        )
        }))
        .filter(zone => zone.slots.length > 0);
  }

  getFloorSlotCount(floor: Floor): number {
    return floor.zones.reduce((total, zone) => {
        return total + zone.slots.length;
    }, 0);
  }
  getStatusLabel(status: SlotStatus): string {
    switch (status) {
        case 'available':
        return 'พร้อมใช้งาน';
        case 'occupied':
        return 'กำลังใช้งาน';
        case 'reserved':
        return 'จองแล้ว';
        case 'maintenance':
        return 'ปิดปรับปรุง';
        default:
        return status;
    }
  }

}