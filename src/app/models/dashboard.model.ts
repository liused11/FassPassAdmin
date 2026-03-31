// app/models/dashboard.model
export interface Metric {
  title: string;
  value: string;
  subtext: string;
  icon: string;
  color: string;
}

export interface Change {
  field: string;
  old: string;
  new: string;
}

export interface Meta {
  location?: string;
  device?: string;
  method?: string;
  verification?: string;
}

export interface RevisionRow {
  field: string;
  old: any;
  new: any;
  changed: boolean;
}

export interface EntityInfo {
  title?: string;
  plate?: string;
  model?: string;
  province?: string;
  slot?: string;
  floor?: string;
}

export interface ContextInfo {
  location?: string;
  device?: string;
  method?: string;
  verification?: string;
  booking_type?: string;
}

export interface ResultInfo {
  status?: string;
  by?: string;
  time?: string;
}

export interface LogDisplay {
  icon: string;
  title: string;
  subtitle: string;
  attributes: { label: string; value: any; color: string }[];
  contexts: { label: string; value: any }[];
  hasChanges: boolean;
}

export interface ActivityLog {
  id: number;
  logType: 'revision' | 'activity';
  time: string;
  type: string;
  action: string;
  user: string;
  category: 'normal' | 'abnormal';
  status: 'success' | 'warning' | 'denied' | 'error';

  entityId?: string;
  entityType?:string;
  detail?: string;

  revisionRows?: RevisionRow[] | null;
  meta?: any | null;
  schedule?: any; 
  changes?: any;   // ✅ ADD

  logDisplay?: LogDisplay;  
}

export interface Reservation {
  id: string;
  user_id: string;
  user: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  room: string;
  type: string;
  status: string;
  color: string;
  original_status: string;
}