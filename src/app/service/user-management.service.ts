import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserMetric {
    title: string;
    value: string;
    subtext: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: string;
    created_at: string;
    joined_date: string;
}

export interface UserManagementResponse {
    metrics: UserMetric[];
    profiles: UserProfile[];
}

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private apiUrl = 'https://unxcjdypaxxztywplqdv.supabase.co/functions/v1/get_profiles_admin';
    private anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA';

    constructor(private http: HttpClient) { }

    getProfiles(token: string): Observable<UserManagementResponse> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            apikey: this.anonKey
        });
        return this.http.get<UserManagementResponse>(this.apiUrl, { headers });
    }
}
