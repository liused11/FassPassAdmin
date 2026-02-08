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
  changes?: Change[];
  meta?: Meta;
}