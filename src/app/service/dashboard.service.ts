import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityLog, Metric } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Make sure your NestJS backend is running on this port
  private apiUrl = 'http://localhost:3000/dashboard'; 

  constructor(private http: HttpClient) { }

  getMetrics(): Observable<Metric[]> {
    return this.http.get<Metric[]>(`${this.apiUrl}/metrics`);
  }

  getActivities(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/activities`);
  }
}