// app/service/inbox-parking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private baseUrl =
    'https://unxcjdypaxxztywplqdv.supabase.co/functions/v1';


  private anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA';

  constructor(private http: HttpClient) {}

  private getHeaders(token: string) {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      apikey: this.anonKey
    });
  }

  getDashboard(token: string, siteId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/get-dashboard-parking?site_id=${siteId}`, 
      { headers: this.getHeaders(token) }
    );
  }
  getBuildingById(id: string, token: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/get-parking-sidebar-detail?id=${id}`,
      { headers: this.getHeaders(token) }
    );
  }
  updateEntities(
    entities: {
      entity_type: string;
      entity_id: string;
      updates: any;
    }[],
    token: string
  ) {
    return this.http.post(
      `${this.baseUrl}/admin-update-multi-entity`,
      {
        entities: entities,
      },
      { 
        headers: this.getHeaders(token) 
      }
    );
  }
  getBuildingSlots(buildingId: string, token: string) {
    return this.http.get<any>(
      `${this.baseUrl}/get-building-slots?building_id=${buildingId}`,
      { headers: this.getHeaders(token) }
    );
  }

  getBuildingHistory(
    buildingId: string,
    limit: number,
    offset: number,
    token: string
  ) {
    return this.http.get<any>(
      `${this.baseUrl}/get-building-history`,
      {
        headers: this.getHeaders(token),
        params: {
          building_id: buildingId,
          limit: limit.toString(),
          offset: offset.toString()
        }
      }
    );
  }
  getSlotSchedule(slotId: string, date: string, token: string) {
    return this.http.get<any>(
      `${this.baseUrl}/get-slot-status`,
      {
        headers: this.getHeaders(token),
        params: {
          slot_id: slotId,
          date: date
        }
      }
    );
  }

  updateSlotStatus(slotIds: string[], status: string, token: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      apikey: this.anonKey,
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${this.baseUrl}/admin_update_slot_status_with_log`,
      {
        slot_ids: slotIds,
        status: status
      },
      { headers }
    );
  }

  upsertSlotOverride(
    payload: {
      slot_id: string;
      mode: 'single' | 'range' | 'weekly';
      date?: string;
      start_date?: string;
      end_date?: string;
      weekday?: number;
      time_ranges: {
        start_time: string;
        end_time: string;
        status: string;
      }[];
    },
    token: string
  ) {
    return this.http.post(
      `${this.baseUrl}/admin_upsert_slot_overrides_with_log`,
      payload,
      { headers: this.getHeaders(token) }
    );
  }
}