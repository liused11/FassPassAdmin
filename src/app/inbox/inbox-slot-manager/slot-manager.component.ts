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

type SlotStatus =
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'maintenance';

interface Slot {
  id: string;        // ใช้ id จริงจาก DB
  name: string;      // A-1
  status: SlotStatus;
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
    InputTextModule
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

  constructor(
    private parkingService: ParkingService
  ) {
    
    // this.generateMockData();
    this.selectedFloor = this.floors[0];
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
  ngOnChanges() {
    console.log('visible:', this.visible);
    console.log('buildingId:', this.buildingId);
    console.log('token:', this.token);

    if (this.visible && this.buildingId && this.token) {
        console.log('CALL loadSlots');
        this.loadSlots();
    }
  }
  
  async loadSlots() {
     if (!this.buildingId || !this.token) return;


    this.parkingService
        .getBuildingSlots(this.buildingId, this.token)
        .subscribe({
        next: (res) => {
            if (!res.success) return;

            this.floors = this.transformApiData(res.data);

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
            status: slot.status,
            selected: false
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
    this.floors.forEach(f =>
        f.zones.forEach(z =>
        z.slots.forEach(s => s.selected = false)
        )
    );
  }

  toggleSlot(slot: Slot) {
    if (slot.status === 'occupied' || slot.status === 'reserved') {
      return; // ห้ามเลือก
    }
    slot.selected = !slot.selected;
  }

  get selectedSlots(): Slot[] {
    if (!this.selectedFloor) return [];
    return this.selectedFloor.zones
      .flatMap(z => z.slots)
      .filter(s => s.selected);
  }

  openDialog() {
    if (this.selectedSlots.length === 0) return;
    this.showDialog = true;
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
            slot.id.toLowerCase().includes(keyword)
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