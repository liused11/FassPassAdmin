// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { RippleModule } from 'primeng/ripple';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel'; // ✅ 1. Import OverlayPanel
import { PrimeNG } from 'primeng/config';
import { SiteStateService } from './service/site/site-state.service';
import { SiteApiService } from './service/site/site-api.service';
import { createClient } from '@supabase/supabase-js';
// Services
import { ModalService } from './service/modal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    AvatarModule,
    DividerModule,
    DynamicDialogModule,
    RippleModule,
    SidebarModule,
    ButtonModule,
    DropdownModule,
    TooltipModule,
    OverlayPanelModule // ✅ 2. Add to imports array
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PrimeNG Admin';
  activeRoute: string = '';
  sidebarVisible: boolean = false;

  siteOptions: any[] = [
    { label: 'All Sites (ภาพรวม)', value: 'all' },
    { label: 'KMITL', value: 'kmitl' },
    { label: 'KMITL2', value: 'kmitl2' },
    { label: 'KMUTT', value: 'kmutt' },
    { label: 'KMUTT2', value: 'kmutt2' }
  ];

  topMenu: any[] = [];
  bottomMenu: any[] = [];

  supabase = createClient(
    'https://unxcjdypaxxztywplqdv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA'
  );

  constructor(
    public router: Router,
    private modalService: ModalService,
    private primeng: PrimeNG,
    private siteStateService: SiteStateService,  // 👈 เพิ่ม
    private siteApi: SiteApiService 
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
        this.sidebarVisible = false;
      });
  }

  get selectedSite(): string {
    return this.siteStateService.getCurrentSite();
  }

  set selectedSite(value: string) {
    this.siteStateService.setSite(value);
  }

  async ngOnInit() {
    this.siteStateService.init();
    this.primeng.ripple.set(true);
    // 🔐 เช็คก่อนว่ามี session อยู่ไหม
    let { data } = await this.supabase.auth.getSession();

    if (!data.session) {
      // ถ้าไม่มีค่อย login
      const { error } = await this.supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: '12345678'
      });

      if (error) {
        console.error('Login failed:', error.message);
        return;
      }

      const sessionResult = await this.supabase.auth.getSession();
      data = sessionResult.data;
    }
    const token = data.session?.access_token;

    if (token) {
      this.siteApi.getSites(token).subscribe(res => {
        this.siteOptions = [
          { label: 'All Sites (ภาพรวม)', value: 'all' },
          ...res.sites.map((s: any) => ({
            label: s.name,
            value: String(s.id)   // ⭐ สำคัญ
          }))
        ];
      });
    }

    this.bottomMenu = [
      { label: 'Settings', icon: 'pi pi-cog', route: '/fp' },
      { label: 'Help', icon: 'pi pi-question-circle', route: '/help' }
    ];

    this.topMenu = [
      { label: 'หน้าหลัก', icon: 'pi pi-home', route: '/dashboard' },
      { label: 'อาคาร', icon: 'pi pi-building', route: '/buildings' },
      { label: 'จัดการการจอง', icon: 'pi pi-th-large', route: '/reserve' },
      { label: 'จัดการผู้ใช้งาน', icon: 'pi pi-user', route: '/customer' },
      // { label: 'แจ้งเตือน', icon: 'pi pi-comment', route: '/chat' },
      // { label: 'Video', icon: 'pi pi-video', route: '/video' },
      { label: 'จัดการลานจอดรถ', icon: 'pi pi-car', route: '/parking' },
      // { label: 'จัดการโซน', icon: 'pi pi-map', route: '/zones' }
    ];

    this.modalService.initListener();
  }

  ngOnDestroy() {
    this.modalService.ngOnDestroy();
  }

  isActive(path: string): boolean {
    return this.activeRoute === path || this.router.url === path;
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  // ✅ 3. Helper to get Current Site Label for Tooltip
  get currentSiteLabel(): string {
    const site = this.siteOptions.find(s => s.value === this.selectedSite);
    return site ? site.label : 'Select Site';
  }
}