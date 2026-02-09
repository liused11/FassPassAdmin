import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ParkingLot } from '../models/parking.model';

@Injectable({
    providedIn: 'root'
})
export class ParkingAdminService {

    private mockData: ParkingLot[] = [
        {
            id: '1',
            name: 'ลานจอดรถ FIBO (N9)',
            lat: 13.653000,
            lng: 100.494000,
            hours: '08:00 - 20:00',
            price: 10,
            priceUnit: 'บาท/ชม.',
            status: 'available',
            userTypes: 'รถยนต์, รถยนต์ EV',
            hasEVCharger: true,
            images: [
                'https://primefaces.org/cdn/primeng/images/galleria/galleria4.jpg'
            ],
            floors: [],
            capacity: { ev: 5, normal: 205, motorcycle: 40 },
            available: { ev: 2, normal: 150, motorcycle: 40 },
            schedule: [],
            supportedTypes: ['car', 'ev', 'motorcycle']
        },
        {
            id: '2',
            name: 'อาคารจอดรถ 14 ชั้น (S2)',
            lat: 13.652011,
            lng: 100.493922,
            hours: '08:00 - 20:00',
            price: 10,
            priceUnit: 'บาท/ชม.',
            status: 'low',
            userTypes: 'รถยนต์, รถจักรยานยนต์',
            hasEVCharger: true,
            images: [
                'https://primefaces.org/cdn/primeng/images/galleria/galleria3.jpg'
            ],
            floors: [{ id: 'f1', name: '1' }],
            capacity: { ev: 10, normal: 386, motorcycle: 100 },
            available: { ev: 5, normal: 20, motorcycle: 50 },
            schedule: [],
            supportedTypes: ['car', 'ev', 'motorcycle']
        }
    ];

    constructor() { }

    getParkingLots(): Observable<ParkingLot[]> {
        return of(this.mockData);
    }

    updateParkingLot(lot: ParkingLot): Observable<ParkingLot> {
        const index = this.mockData.findIndex(l => l.id === lot.id);
        if (index !== -1) {
            this.mockData[index] = lot;
        }
        return of(lot);
    }
}
