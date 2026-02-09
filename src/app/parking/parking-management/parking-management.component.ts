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
import { DividerModule } from 'primeng/divider';
import { ParkingLot } from '../../models/parking.model';
import { ParkingAdminService } from '../../service/parking-admin.service';

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
        DividerModule
    ],
    templateUrl: './parking-management.component.html',
    styleUrls: ['./parking-management.component.scss']
})
export class ParkingManagementComponent implements OnInit {

    parkingLots: ParkingLot[] = [];
    displayDialog: boolean = false;
    selectedParkingLot: ParkingLot | null = null;
    editingParkingLot: ParkingLot | any = {};

    statusOptions = [
        { label: 'Available', value: 'available' },
        { label: 'Full', value: 'full' },
        { label: 'Closed', value: 'closed' },
        { label: 'Low', value: 'low' }
    ];

    constructor(private parkingAdminService: ParkingAdminService) { }

    ngOnInit(): void {
        this.parkingAdminService.getParkingLots().subscribe(data => {
            this.parkingLots = data;
        });
    }

    getSeverity(status: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
        switch (status) {
            case 'available':
                return 'success';
            case 'low':
                return 'warning';
            case 'full':
                return 'danger';
            case 'closed':
                return 'secondary';
            default:
                return 'info';
        }
    }

    getOccupancyPercentage(lot: ParkingLot): number {
        if (!lot.capacity.normal) return 0;
        const occupancy = 100 - (lot.available.normal / lot.capacity.normal * 100);
        return Math.round(occupancy);
    }

    openManageDialog(lot: ParkingLot): void {
        this.selectedParkingLot = lot;
        this.editingParkingLot = JSON.parse(JSON.stringify(lot));
        this.displayDialog = true;
    }

    saveChanges(): void {
        if (this.selectedParkingLot) {
            console.log('Update Parking Lot Payload:', this.editingParkingLot);

            const index = this.parkingLots.findIndex(p => p.id === this.editingParkingLot.id);
            if (index !== -1) {
                this.parkingLots[index] = { ...this.editingParkingLot };
            }
            this.displayDialog = false;
        }
    }
}
