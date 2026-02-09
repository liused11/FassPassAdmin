export interface ParkingCapacity {
    ev: number;
    normal: number;
    motorcycle: number;
}

export interface ParkingSchedule {
    cron: { open: string; close: string };
    days: string[];
    open_time: string;
    close_time: string;
}

export interface ParkingFloor {
    id: string;
    name: string;
}

export interface ParkingLot {
    id: string;
    name: string;
    lat: number;
    lng: number;
    hours: string;      // e.g., "เปิด 08:00 - 20:00"
    price: number;
    priceUnit: string;  // e.g., "ฟรี"
    status: 'available' | 'full' | 'closed' | 'low';
    userTypes: string;  // e.g., "นศ., บุคลากร"
    hasEVCharger: boolean;
    images: string[];
    floors: ParkingFloor[];
    capacity: ParkingCapacity;
    available: ParkingCapacity;
    schedule: ParkingSchedule[];
    supportedTypes: string[];
    address?: string; // Optional since not in the new spec but good to keep from previous
}
