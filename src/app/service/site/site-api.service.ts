// site-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SiteApiService {
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

  getSites(token: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/get_sites`,
      { headers: this.getHeaders(token) }
    );
  }
}