// app/models/parking-edit-sidebar.model.ts
export interface ParkingEditSidebarModel {
  id: string;
  name: string;
  address: string;
  imageUrl: string[];

  isActive: boolean;

  openTime: string;
  closeTime: string;

  hourlyRate: number;

  // เพิ่มตัวนี้เข้าไป
  role_prices?: {
    Host: number;
    User: number;
    Visitor: number;
  };
}
