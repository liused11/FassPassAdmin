import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// ดึง Supabase Client ตัวเดียวกับที่เซ็ตไว้
import { supabase } from '../supabase.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  loading = false;
  authListener: any;

  constructor(private router: Router, private messageService: MessageService) {}

  async ngOnInit() {
    // 💡 1. เช็คทันทีตอนโหลดหน้า: เผื่อว่าล็อกอินค้างไว้อยู่แล้ว (หรือ Supabase อ่าน URL ไวมาก)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // 💡 2. ดักจับ Event ตอนกด Magic Link
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth Event in Login:', event);
      
      // ✅ เปลี่ยนมาเช็คแค่ "ถ้ามี Session" ก็ให้เข้าได้เลย ไม่ต้องสนชื่อ Event
      if (session) {
        this.router.navigate(['/dashboard']); 
      }
    });
    
    this.authListener = data.subscription;
  }

  ngOnDestroy() {
    if (this.authListener) {
      this.authListener.unsubscribe();
    }
  }

  // ✅ ฟังก์ชันล็อกอินด้วย Magic Link
  async sendMagicLink() {
    if (!this.email || !this.email.includes('@')) {
      this.messageService.add({ severity: 'warn', summary: 'แจ้งเตือน', detail: 'กรุณากรอกอีเมลให้ถูกต้อง' });
      return;
    }

    this.loading = true;
    const { error } = await supabase.auth.signInWithOtp({
      email: this.email,
      options: {
        // 💡 แนะนำให้เปิดใช้งาน Redirect ตรงนี้ เพื่อความชัวร์ว่ามันจะเด้งกลับมาที่แอปเรา
        emailRedirectTo: window.location.origin + '/dashboard'
      }
    });

    if (error) {
      this.messageService.add({ severity: 'error', summary: 'ผิดพลาด', detail: error.message });
    } else {
      this.messageService.add({ 
        severity: 'success', 
        summary: 'เช็คอีเมลของคุณ!', 
        detail: 'เราได้ส่ง Magic Link สำหรับเข้าสู่ระบบไปที่อีเมลของคุณแล้ว' 
      });
      // เคลียร์ช่องพิมพ์อีเมลเมื่อส่งสำเร็จ
      this.email = '';
    }
    this.loading = false;
  }
}