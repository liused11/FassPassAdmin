export type ParkingHistoryType = 'status' | 'rate' | 'time';

export type ParkingHistoryColor = 'blue' | 'red' | 'gray';

export interface ParkingHistoryItem {
  id?: string;
  type: ParkingHistoryType;

  title: string;
  description?: string;

  time: string;              // เช่น "5 นาทีที่แล้ว"
  icon: string;              // เช่น "pi pi-car"

  color?: ParkingHistoryColor;
  createdAt?: string;        // ISO date เผื่อ backend ส่งมา
}