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
  detail?: string;
  changes?: Change[] | null;
  meta?: Meta | null;
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