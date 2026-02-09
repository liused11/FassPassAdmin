import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ParkingLot } from '../models/parking.model';

@Injectable({
    providedIn: 'root'
})
export class ParkingService {

    private mockData: ParkingLot[] = [
        {
            id: '1',
            name: 'ลานจอดรถ 14 ชั้น (S2)',
            lat: 13.652011,
            lng: 100.493922,
            hours: '08:00 - 20:00',
            price: 10,
            priceUnit: 'บาท/ชม.',
            address: '91 ถ. ประชาอุทิศ แขวงบางมด เขตทุ่งครุ กรุงเทพมหานคร 10140',
            images: [
                'https://primefaces.org/cdn/primeng/images/galleria/galleria3.jpg'
            ],
            status: 'available',
            capacity: { ev: 10, normal: 386, motorcycle: 100 },
            available: { ev: 5, normal: 317, motorcycle: 50 },
            hasEVCharger: true,
            userTypes: 'รถยนต์, รถยนต์ EV',
            floors: [{ id: 'f1', name: '1' }]
        },
        {
            id: '2',
            name: 'ลานจอดรถอาคารการเรียนรู้พหุวิทยาการ (N16)',
            lat: 13.652500,
            lng: 100.493500,
            hours: '08:00 - 18:00',
            price: 10,
            priceUnit: 'บาท/ชม.',
            address: 'อาคารการเรียนรู้พหุวิทยาการ แขวงบางมด เขตทุ่งครุ กรุงเทพมหานคร 10140',
            images: [
                'https://primefaces.org/cdn/primeng/images/galleria/galleria2.jpg'
            ],
            status: 'available', // The screenshot says 'กำลังจะปิด' which effectively we'll map to 'warning' status in UI
            capacity: { ev: 2, normal: 50, motorcycle: 20 },
            available: { ev: 1, normal: 40, motorcycle: 10 },
            hasEVCharger: true,
            userTypes: 'รถยนต์, รถจักรยานยนต์',
            floors: []
        },
        {
            id: '3',
            name: 'ลานจอดรถ FIBO (N9)',
            lat: 13.653000,
            lng: 100.494000,
            hours: '08:00 - 20:00',
            price: 10,
            priceUnit: 'บาท/ชม.',
            address: 'FIBO แขวงบางมด เขตทุ่งครุ กรุงเทพมหานคร 10140',
            images: [
                'https://primefaces.org/cdn/primeng/images/galleria/galleria4.jpg'
            ],
            status: 'available',
            capacity: { ev: 5, normal: 205, motorcycle: 40 },
            available: { ev: 2, normal: 150, motorcycle: 40 },
            hasEVCharger: true,
            userTypes: 'รถยนต์, รถยนต์ EV',
            floors: []
        },
        {
            id: '4',
            name: 'ลานจอดรถหน้าคณะพลังงานสิ่งแวดล้อมและวัสดุ (S9)',
            lat: 13.651500,
            lng: 100.492500,
            hours: '08:00 - 20:00',
            price: 10,
            priceUnit: 'บาท/ชม.',
            address: 'คณะพลังงานสิ่งแวดล้อมและวัสดุ แขวงบางมด เขตทุ่งครุ กรุงเทพมหานคร 10140',
            images: ['https://primefaces.org/cdn/primeng/images/galleria/galleria1.jpg'],
            status: 'full', // 'เต็ม' from screenshot
            capacity: { ev: 0, normal: 39, motorcycle: 15 },
            available: { ev: 0, normal: 0, motorcycle: 5 },
            hasEVCharger: false,
            userTypes: 'รถยนต์, รถยนต์ EV, รถจักรยานยนต์',
            floors: []
        }
    ];

    constructor() { }

    getParkingLots(): Observable<ParkingLot[]> {
        return of(this.mockData);
    }
}
