// parking-history.model.ts
export interface ParkingHistoryItem {
  id: string;

  logType: string;
  entityType: string;
  entityId: string;

  field?: string | null;
  oldValue?: any;
  newValue?: any;

  action: string;
  updatedBy: string;
  updatedAt: string;
}