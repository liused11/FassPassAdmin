// site.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SiteStateService {

  private siteSubject = new BehaviorSubject<string>('all');
  site$ = this.siteSubject.asObservable();

  setSite(site: string) {
    this.siteSubject.next(site);
    localStorage.setItem('selectedSite', site);
  }

  getCurrentSite(): string {
    return this.siteSubject.value;
  }

  init() {
    const saved = localStorage.getItem('selectedSite');
    if (saved) this.siteSubject.next(saved);
  }
}