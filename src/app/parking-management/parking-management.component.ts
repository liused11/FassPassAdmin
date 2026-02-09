import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ParkingLot } from '../models/parking.model';
import { ParkingService } from '../service/parking.service';

@Component({
    selector: 'app-parking-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        TagModule,
        ProgressBarModule,
        DialogModule,
        InputNumberModule,
        DropdownModule,
        InputTextModule,
        CheckboxModule,
        TableModule,
        IconFieldModule,
        InputIconModule
    ],
    templateUrl: './parking-management.component.html',
    styleUrls: ['./parking-management.component.scss']
})
export class ParkingManagementComponent implements OnInit {

    parkingLots: ParkingLot[] = [];
    selectedParkingLots: ParkingLot[] = [];

    displayDialog: boolean = false;
    selectedParkingLot: ParkingLot | null = null;
    editingParkingLot: ParkingLot | any = {};

    metrics: any[] = [];

    statusOptions = [
        { label: 'Available', value: 'available' },
        { label: 'Full', value: 'full' },
        { label: 'Closed', value: 'closed' }
    ];

    constructor(private parkingService: ParkingService) { }

    ngOnInit(): void {
        this.parkingService.getParkingLots().subscribe(data => {
            this.parkingLots = data;
            this.calculateMetrics();
        });
    }

    calculateMetrics() {
        const totalLots = this.parkingLots.length;
        const totalNormalCapacity = this.parkingLots.reduce((acc, lot) => acc + lot.capacity.normal, 0);
        const totalEVCapacity = this.parkingLots.reduce((acc, lot) => acc + lot.capacity.ev, 0);
        const totalMotoCapacity = this.parkingLots.reduce((acc, lot) => acc + lot.capacity.motorcycle, 0);

        this.metrics = [
            { title: 'ลานจอดรถทั้งหมด', value: totalLots, icon: 'pi pi-map-marker', color: 'text-blue-600' },
            { title: 'ที่จอดรถยนต์ทั้งหมด', value: totalNormalCapacity, icon: 'pi pi-car', color: 'text-blue-600' },
            { title: 'ที่จอดรถยนต์ EV ทั้งหมด', value: totalEVCapacity, icon: 'pi pi-bolt', color: 'text-blue-600' },
            { title: 'ที่จอดรถจักรยานยนต์ทั้งหมด', value: totalMotoCapacity, icon: 'pi pi-compass', color: 'text-blue-600' }
        ];
    }

    getSeverity(status: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
        switch (status) {
            case 'available':
                return 'success';
            case 'full':
                return 'danger';
            case 'closed':
                return 'secondary';
            default:
                return 'info';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'available': return 'ใช้งานอยู่';
            case 'full': return 'เต็ม';
            case 'closed': return 'ปิดใช้งานอยู่';
            default: return status;
        }
    }

    openManageDialog(lot: ParkingLot): void {
        this.selectedParkingLot = lot;
        this.editingParkingLot = JSON.parse(JSON.stringify(lot));
        this.displayDialog = true;
    }

    saveChanges(): void {
        if (this.selectedParkingLot) {
            const index = this.parkingLots.findIndex(p => p.id === this.editingParkingLot.id);
            if (index !== -1) {
                this.parkingLots[index] = { ...this.editingParkingLot };
                this.parkingLots = [...this.parkingLots]; // trigger change detection 
                this.calculateMetrics();
            }
            this.displayDialog = false;
        }
    }
}
