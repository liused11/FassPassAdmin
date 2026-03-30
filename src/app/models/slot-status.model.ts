// slot-status.model.ts
export type SlotStatus =
  | 'available'   // ว่าง
  | 'reserved'    // จองแล้ว
  | 'occupied'    // มีรถจอดอยู่
  | 'maintenance' // ปิดปรับปรุง
