// app/service/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityLog, Metric } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Make sure your NestJS backend is running on this port
  //private apiUrl = 'http://localhost:3000/dashboard'; 
  private edgeUrl =
    'https://unxcjdypaxxztywplqdv.supabase.co/functions/v1/get-activities';

  private anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA';

  constructor(private http: HttpClient) { }

  /*getDashboardMetrics(): Observable<Metric[]> {
    return this.http.get<Metric[]>(`${this.apiUrl}/metrics`);
  }*/


  /*getAllActivities(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/activities`);
  }*/
  getAllActivities(date: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      apikey: this.anonKey
    });

    return this.http.get<any>(`${this.edgeUrl}?date=${date}`, { headers });
  }
}