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
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PrimeNG } from 'primeng/config';

import { SiteStateService } from './service/site/site-state.service';
import { SiteApiService } from './service/site/site-api.service';
import { ModalService } from './service/modal.service';
import { filter } from 'rxjs/operators';

// ✅ 1. Import supabase จาก config เพื่อแก้ปัญหา Timeout และ Lock
import { supabase } from './supabase.config';

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
    OverlayPanelModule 
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PrimeNG Admin';
  activeRoute: string = '';
  sidebarVisible: boolean = false;
  
  // ✅ 2. ตัวแปรเช็คว่าตอนนี้อยู่หน้า Login หรือไม่ (เพื่อซ่อนเมนู)
  isLoginPage: boolean = false;

  siteOptions: any[] = [
    { label: 'All Sites (ภาพรวม)', value: 'all' },
    { label: 'KMITL', value: 'kmitl' },
    { label: 'KMITL2', value: 'kmitl2' },
    { label: 'KMUTT', value: 'kmutt' },
    { label: 'KMUTT2', value: 'kmutt2' }
  ];

  topMenu: any[] = [];
  bottomMenu: any[] = [];
  authListener: any;

  constructor(
    public router: Router,
    private modalService: ModalService,
    private primeng: PrimeNG,
    private siteStateService: SiteStateService,  
    private siteApi: SiteApiService 
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
        this.sidebarVisible = false;
        // เช็คว่า URL มีคำว่า login ไหม
        this.isLoginPage = this.activeRoute.includes('/login');
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

    const { data } = await supabase.auth.getSession();

    // 💡 เช็คก่อนว่า URL ปัจจุบันกำลังมี Token จาก Magic Link แปะมาด้วยหรือไม่
    const isMagicLink = window.location.hash.includes('access_token');

    if (!data.session && !isMagicLink) {
      // ถ้าไม่มี Session และ ไม่ได้กำลังกดลิงก์มาจากอีเมล -> ค่อยเตะไปหน้า Login
      this.router.navigate(['/login']);
    } else if (data.session) {
      // ถ้ามี Session อยู่แล้ว -> โหลดข้อมูล
      this.loadUserSites(data.session.access_token);
    }

    // ✅ 4. ดักจับการเปลี่ยนแปลง (เช่น หมดอายุ หรือ กด Log Out)
    const authChange = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        this.router.navigate(['/login']);
      } else if (event === 'SIGNED_IN' && session) {
        this.loadUserSites(session.access_token);
      }
    });
    this.authListener = authChange.data.subscription;

    this.bottomMenu = [
      { label: 'Settings', icon: 'pi pi-cog', route: '/fp' },
      { label: 'Help', icon: 'pi pi-question-circle', route: '/help' }
    ];

    this.topMenu = [
      { label: 'หน้าหลัก', icon: 'pi pi-home', route: '/dashboard' },
      { label: 'อาคาร', icon: 'pi pi-building', route: '/buildings' },
      { label: 'จัดการการจอง', icon: 'pi pi-th-large', route: '/reserve' },
      { label: 'จัดการผู้ใช้งาน', icon: 'pi pi-user', route: '/customer' },
      { label: 'จัดการลานจอดรถ', icon: 'pi pi-car', route: '/parking' },
    ];

    this.modalService.initListener();
  }

  ngOnDestroy() {
    this.modalService.ngOnDestroy();
    if (this.authListener) {
      this.authListener.unsubscribe();
    }
  }

  // แยกฟังก์ชันโหลด Site ออกมาเพื่อความสะอาด
  loadUserSites(token: string) {
    this.siteApi.getSites(token).subscribe(res => {
      if (res && res.sites) {
        this.siteOptions = [
          { label: 'All Sites (ภาพรวม)', value: 'all' },
          ...res.sites.map((s: any) => ({
            label: s.name,
            value: String(s.id)  
          }))
        ];
      }
    });
  }

  isActive(path: string): boolean {
    return this.activeRoute === path || this.router.url === path;
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  get currentSiteLabel(): string {
    const site = this.siteOptions.find(s => s.value === this.selectedSite);
    return site ? site.label : 'Select Site';
  }

  // ✅ 5. ฟังก์ชันสำหรับ Log Out
  async logout() {
    await supabase.auth.signOut();
    this.router.navigate(['/login']);
  }
}