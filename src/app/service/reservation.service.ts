// app/service/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { supabase } from '../supabase.config';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  private edgeUrl = 'https://unxcjdypaxxztywplqdv.supabase.co/functions/v1/get_user_reservations_admin';
  private accessTicketUrl = 'https://unxcjdypaxxztywplqdv.supabase.co/functions/v1/access-tickets';
  private buildingResUrl = 'https://unxcjdypaxxztywplqdv.supabase.co/functions/v1/get-building-reservations';

  private anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA';

  constructor(private http: HttpClient) { }

  // ✅ 1. ดึงที่จอดรถ
  getUserReservations(token: string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, apikey: this.anonKey });
    return this.http.get<any>(this.edgeUrl, { headers });
  }

  // ✅ 2. ดึงตั๋วเข้าอาคาร
  getAccessTickets(token: string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, apikey: this.anonKey });
    return this.http.get<any>(this.accessTicketUrl, { headers });
  }

  // ✅ 3. ดึงสถานที่จอง
  getBuildingReservations(token: string, buildingId?: string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, apikey: this.anonKey });
    let params = new HttpParams();
    if (buildingId) params = params.set('building_id', buildingId);
    return this.http.get<any>(this.buildingResUrl, { headers, params });
  }

  createReservation(payload: any): Observable<any> {
    return from(supabase.from('reservations').insert(payload));
  }

  updateReservation(id: string, payload: any): Observable<any> {
    return from(supabase.from('reservations').update(payload).eq('id', id));
  }
}