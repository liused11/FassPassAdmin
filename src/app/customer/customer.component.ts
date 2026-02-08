import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  category: 'Internal' | 'External' | 'Hybrid';
  role: string;
  authMethod: string;
  status: string;
  lastActive: string;
  registerDate: string;
  expiryDate: string | null;
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    AvatarModule,
    TagModule,
    TooltipModule,
    BadgeModule
  ],
  templateUrl: './customer.component.html',
  styles: [`
    /* Custom scrollbar for mobile sidebar tabs */
    .overflow-x-auto::-webkit-scrollbar {
      display: none;
    }
    .overflow-x-auto {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class CustomerComponent implements OnInit {
  
  // State
  selectedCategory: string = 'All';
  selectedUsers: User[] = [];
  selectedDate: Date | undefined;

  // Metrics
  metrics = [
    { title: 'ผู้ใช้งานทั้งหมด', value: '3,853', subtext: 'Total Users', icon: 'pi pi-users' },
    { title: 'กำลังปฏิบัติงาน', value: '415', subtext: 'On-site Now', icon: 'pi pi-building' },
    { title: 'ผู้มาติดต่อ (Visitor)', value: '1,205', subtext: 'Logged Today', icon: 'pi pi-id-card' },
    { title: 'แจ้งเตือนหมดอายุ', value: '5', subtext: 'Expired Access', icon: 'pi pi-exclamation-triangle' }
  ];

  // Options
roleOptions = [
    { label: 'Role ทั้งหมด', value: null },
    { label: 'Super Admin', value: 'Super Admin' },
    { label: 'Staff (พนักงาน)', value: 'Employee' },
    { label: 'Hybrid Tech (ช่างประจำ)', value: 'Hybrid Tech' },
    { label: 'Consultant (ที่ปรึกษา)', value: 'Consultant' },
    { label: 'Security (รปภ.)', value: 'Security' },
    { label: 'Technician (ช่างรายครั้ง)', value: 'Technician' },
    { label: 'Guest', value: 'Guest' }
  ];

  authOptions = [
    { label: 'ช่องทางทั้งหมด', value: null },
    { label: 'App / Line OA', value: 'Line OA' },
    { label: 'Kiosk (Walk-in)', value: 'Kiosk' },
    { label: 'Face Scan', value: 'Face Scan' },
    { label: 'แลกบัตร (ID Card)', value: 'ID Exchange' }
  ];

  statusOptions = [
    { label: 'สถานะ', value: null },
    { label: 'Active', value: 'Active' },
    { label: 'Checked In', value: 'Checked In' },
    { label: 'Checked Out', value: 'Checked Out' },
    { label: 'Blacklist', value: 'Blacklist' }
  ];

  // Mock Data
  // ✅ Complete Mock Data with 'registerDate'
  allUsers: User[] = [
    // =================================================================
    // 🏢 INTERNAL USERS (Employees, Admin, Security)
    // =================================================================
    { 
      id: 'INT-001', firstName: 'สมชาย', lastName: 'ใจดี', phone: '081-111-1234', email: 'somchai.admin@company.com', 
      company: 'HQ Office', category: 'Internal', role: 'Super Admin', authMethod: 'System', 
      status: 'Active', lastActive: 'Now', expiryDate: null, registerDate: '2023-01-15' 
    },
    { 
      id: 'INT-002', firstName: 'วิภา', lastName: 'รักงาน', phone: '089-222-3333', email: 'wipa.hr@company.com', 
      company: 'HR Dept.', category: 'Internal', role: 'Admin', authMethod: 'Face Scan', 
      status: 'Active', lastActive: '10 mins ago', expiryDate: null, registerDate: '2023-02-01' 
    },
    { 
      id: 'INT-003', firstName: 'ธนพล', lastName: 'เก่งกาจ', phone: '081-444-5555', email: 'tanapol.it@company.com', 
      company: 'IT Support', category: 'Internal', role: 'Employee', authMethod: 'System', 
      status: 'Active', lastActive: '2 mins ago', expiryDate: null, registerDate: '2023-03-10' 
    },
    { 
      id: 'INT-004', firstName: 'ลลิตา', lastName: 'มีทรัพย์', phone: '086-777-8888', email: 'lalita.acc@company.com', 
      company: 'Finance', category: 'Internal', role: 'Employee', authMethod: 'Face Scan', 
      status: 'Active', lastActive: '1 hour ago', expiryDate: null, registerDate: '2023-05-20' 
    },
    { 
      id: 'INT-005', firstName: 'ก้องภพ', lastName: 'มั่นคง', phone: '085-555-4444', email: '', 
      company: 'Security Team', category: 'Internal', role: 'Security', authMethod: 'Card Access', 
      status: 'Checked In', lastActive: 'Main Gate', expiryDate: null, registerDate: '2023-06-01' 
    },
    { 
      id: 'INT-006', firstName: 'มานะ', lastName: 'อดทน', phone: '084-555-6666', email: 'mana.logis@company.com', 
      company: 'Logistics', category: 'Internal', role: 'Employee', authMethod: 'Card Access', 
      status: 'Checked Out', lastActive: 'Yesterday', expiryDate: null, registerDate: '2023-08-15' 
    },
    { 
      id: 'INT-007', firstName: 'ดร.อาทิตย์', lastName: 'แสงทอง', phone: '081-999-8888', email: 'arthit.ceo@company.com', 
      company: 'Executive', category: 'Internal', role: 'Super Admin', authMethod: 'Face Scan', 
      status: 'Active', lastActive: '3 hours ago', expiryDate: null, registerDate: '2022-12-01' 
    },
    { 
      id: 'INT-008', firstName: 'สุดา', lastName: 'สวยงาม', phone: '090-111-2222', email: 'suda.mkt@company.com', 
      company: 'Marketing', category: 'Internal', role: 'Employee', authMethod: 'App / Line OA', 
      status: 'Active', lastActive: '15 mins ago', expiryDate: null, registerDate: '2024-01-10' 
    },
    { 
      id: 'INT-009', firstName: 'สมศักดิ์', lastName: 'ภักดี', phone: '089-333-4444', email: '', 
      company: 'Security Team', category: 'Internal', role: 'Security', authMethod: 'Card Access', 
      status: 'Checked In', lastActive: 'Parking B', expiryDate: null, registerDate: '2024-02-15' 
    },
    { 
      id: 'INT-010', firstName: 'James', lastName: 'Wilson', phone: '092-444-5555', email: 'james.w@company.com', 
      company: 'Intl. Sales', category: 'Internal', role: 'Employee', authMethod: 'System', 
      status: 'Active', lastActive: 'Remote (VPN)', expiryDate: null, registerDate: '2024-03-01' 
    },
    { 
      id: 'INT-011', firstName: 'กานดา', lastName: 'บริการ', phone: '087-777-8888', email: 'kanda.cs@company.com', 
      company: 'Customer Service', category: 'Internal', role: 'Employee', authMethod: 'System', 
      status: 'Active', lastActive: 'Now', expiryDate: null, registerDate: '2024-04-12' 
    },
    { 
      id: 'INT-012', firstName: 'ปิติ', lastName: 'เขียนโค้ด', phone: '086-666-5555', email: 'piti.dev@company.com', 
      company: 'IT Dev', category: 'Internal', role: 'Employee', authMethod: 'System', 
      status: 'Active', lastActive: '5 mins ago', expiryDate: null, registerDate: '2024-05-30' 
    },

    // =================================================================
    // ⚙️ HYBRID USERS (Contractors, Long-term Consultants)
    // =================================================================
    { 
      id: 'HYB-001', firstName: 'David', lastName: 'Engineering', phone: '099-123-9999', email: 'david.e@siemens.com', 
      company: 'Siemens (Site Eng)', category: 'Hybrid', role: 'Hybrid Tech', authMethod: 'Face Scan', 
      status: 'Active', lastActive: 'Server Room B', expiryDate: '2026-12-31', registerDate: '2025-01-10' 
    },
    { 
      id: 'HYB-002', firstName: 'วิศวะ', lastName: 'ประจำตึก', phone: '089-555-4444', email: 'witsawa@pm-group.com', 
      company: 'PM Group', category: 'Hybrid', role: 'Hybrid Tech', authMethod: 'Card Access', 
      status: 'Checked In', lastActive: 'Control Room', expiryDate: '2027-01-01', registerDate: '2025-01-15' 
    },
    { 
      id: 'HYB-003', firstName: 'Jennifer', lastName: 'Consult', phone: '061-987-6543', email: 'jen.audit@big4.com', 
      company: 'Audit Firm', category: 'Hybrid', role: 'Consultant', authMethod: 'App / Line OA', 
      status: 'Active', lastActive: 'Meeting Room 5', expiryDate: '2026-06-30', registerDate: '2025-02-01' 
    },
    { 
      id: 'HYB-004', firstName: 'สมปอง', lastName: 'โภชนา', phone: '081-111-9999', email: '', 
      company: 'Food Court Mgt.', category: 'Hybrid', role: 'Hybrid Tech', authMethod: 'Face Scan', 
      status: 'Active', lastActive: 'Canteen', expiryDate: '2026-12-31', registerDate: '2025-02-10' 
    },
    { 
      id: 'HYB-005', firstName: 'ป้าแมว', lastName: 'สะอาด', phone: '082-222-3333', email: '', 
      company: 'PCS Cleaning', category: 'Hybrid', role: 'Hybrid Tech', authMethod: 'Card Access', 
      status: 'Checked In', lastActive: 'Floor 1 Lobby', expiryDate: '2026-12-31', registerDate: '2025-01-05' 
    },
    { 
      id: 'HYB-006', firstName: 'ลุงแดง', lastName: 'สวนสวย', phone: '083-333-4444', email: '', 
      company: 'Green Garden Co.', category: 'Hybrid', role: 'Hybrid Tech', authMethod: 'Face Scan', 
      status: 'Active', lastActive: 'Garden Zone', expiryDate: '2026-12-31', registerDate: '2025-01-05' 
    },
    { 
      id: 'HYB-007', firstName: 'Michael', lastName: 'SAP', phone: '090-555-1212', email: 'mike@sap-support.com', 
      company: 'SAP Support', category: 'Hybrid', role: 'Consultant', authMethod: 'System', 
      status: 'Checked Out', lastActive: 'Yesterday', expiryDate: '2026-03-31', registerDate: '2025-03-01' 
    },
    { 
      id: 'HYB-008', firstName: 'Aiko', lastName: 'Tanaka', phone: '094-111-2222', email: 'aiko@jp-advisor.com', 
      company: 'JP Advisor', category: 'Hybrid', role: 'Consultant', authMethod: 'Face Scan', 
      status: 'Active', lastActive: 'Meeting Room 2', expiryDate: '2026-09-30', registerDate: '2025-03-15' 
    },
    { 
      id: 'HYB-009', firstName: 'ช่างบอย', lastName: 'ลิฟต์', phone: '088-999-0000', email: 'boy@schindler.com', 
      company: 'Schindler Lift', category: 'Hybrid', role: 'Hybrid Tech', authMethod: 'Card Access', 
      status: 'Active', lastActive: 'Lift Hall C', expiryDate: '2026-12-31', registerDate: '2025-02-20' 
    },

    // =================================================================
    // 🌍 EXTERNAL USERS (Guests, Technicians, Visitors)
    // =================================================================
    { 
      id: 'EXT-TEC-01', firstName: 'ณัฐพงศ์', lastName: 'วงษ์สว่าง', phone: '092-333-4444', email: '', 
      company: 'Siam Elevator (OTIS)', category: 'External', role: 'Technician', authMethod: 'ID Exchange', 
      status: 'Checked In', lastActive: 'Lift Hall A', expiryDate: '2026-12-31', registerDate: '2026-01-25' 
    },
    { 
      id: 'EXT-TEC-02', firstName: 'ทีมช่าง', lastName: 'แอร์เซอร์วิส', phone: '081-777-6666', email: 'service@coolair.com', 
      company: 'Cool Air Service', category: 'External', role: 'Technician', authMethod: 'Kiosk', 
      status: 'Active', lastActive: 'Roof Top', expiryDate: '2026-01-20', registerDate: '2026-01-19' 
    },
    { 
      id: 'EXT-TEC-03', firstName: 'ช่างทรู', lastName: 'อินเทอร์เน็ต', phone: '095-555-1212', email: '', 
      company: 'True Corp', category: 'External', role: 'Technician', authMethod: 'Line OA', 
      status: 'Pending', lastActive: 'Waiting Approval', expiryDate: '2026-01-30', registerDate: '2026-01-29' 
    },
    { 
      id: 'EXT-TEC-04', firstName: 'ช่างไฟ', lastName: 'การไฟฟ้า', phone: '084-555-1234', email: '', 
      company: 'MEA', category: 'External', role: 'Technician', authMethod: 'ID Exchange', 
      status: 'Checked In', lastActive: 'Electrical Room', expiryDate: '2026-02-01', registerDate: '2026-01-28' 
    },
    { 
      id: 'EXT-TEC-05', firstName: 'ทีมกำจัด', lastName: 'ปลวก', phone: '081-888-9999', email: 'bug@protect.com', 
      company: 'Bug Protect', category: 'External', role: 'Contractor', authMethod: 'Kiosk', 
      status: 'Active', lastActive: 'Canteen Area', expiryDate: '2026-02-01', registerDate: '2026-01-28' 
    },
    { 
      id: 'EXT-TEC-06', firstName: 'ช่าง AIS', lastName: 'Fibre', phone: '098-777-6666', email: '', 
      company: 'AIS', category: 'External', role: 'Technician', authMethod: 'Line OA', 
      status: 'Checked Out', lastActive: '30 mins ago', expiryDate: '2026-01-26', registerDate: '2026-01-26' 
    },
    { 
      id: 'EXT-CON-01', firstName: 'บ.การช่าง', lastName: 'จำกัด', phone: '02-123-4567', email: 'contact@karnchang.com', 
      company: 'Karnchang', category: 'External', role: 'Contractor', authMethod: 'ID Exchange', 
      status: 'Checked In', lastActive: 'Renovation Zone', expiryDate: '2026-04-15', registerDate: '2026-01-15' 
    },
    { 
      id: 'EXT-GST-01', firstName: 'John', lastName: 'Davenport', phone: '090-123-4567', email: 'john.d@partner.com', 
      company: 'Global Tech Inc.', category: 'External', role: 'Guest', authMethod: 'Line OA', 
      status: 'Active', lastActive: 'Meeting Room 1', expiryDate: '2026-01-26', registerDate: '2026-01-26' 
    },
    { 
      id: 'EXT-GST-02', firstName: 'Sarah', lastName: 'Connor', phone: '091-987-6543', email: 'sarah@skynet.com', 
      company: 'Freelance', category: 'External', role: 'Guest', authMethod: 'Kiosk', 
      status: 'Blacklist', lastActive: '2 months ago', expiryDate: '2025-12-01', registerDate: '2025-11-20' 
    },
    { 
      id: 'EXT-GST-03', firstName: 'Alice', lastName: 'Wong', phone: '085-555-1111', email: 'alice@audit.com', 
      company: 'PwC Thailand', category: 'External', role: 'Guest', authMethod: 'System', 
      status: 'Active', lastActive: 'Finance Dept.', expiryDate: '2026-01-30', registerDate: '2026-01-25' 
    },
    { 
      id: 'EXT-GST-04', firstName: 'ผู้สมัคร', lastName: 'งาน A', phone: '099-000-1111', email: 'job@email.com', 
      company: 'Interviewee', category: 'External', role: 'Guest', authMethod: 'Kiosk', 
      status: 'Checked In', lastActive: 'HR Room', expiryDate: '2026-01-26', registerDate: '2026-01-26' 
    },
    { 
      id: 'EXT-GST-05', firstName: 'สุดา', lastName: 'ขายเก่ง', phone: '081-222-3333', email: 'suda@office-supply.com', 
      company: 'Office Supply Co.', category: 'External', role: 'Guest', authMethod: 'Line OA', 
      status: 'Checked Out', lastActive: '30 mins ago', expiryDate: '2026-01-26', registerDate: '2026-01-26' 
    },
    { 
      id: 'EXT-GST-06', firstName: 'Kenji', lastName: 'Sato', phone: '094-444-5555', email: 'kenji@jp-cons.com', 
      company: 'JP Consultant', category: 'External', role: 'Guest', authMethod: 'Face Scan', 
      status: 'Active', lastActive: 'Meeting Room 3', expiryDate: '2026-01-27', registerDate: '2026-01-20' 
    },
    { 
      id: 'EXT-GST-07', firstName: 'วิชัย', lastName: 'อยากรู้', phone: '089-111-1111', email: '', 
      company: 'Student (Intern)', category: 'External', role: 'Guest', authMethod: 'Card Access', 
      status: 'Active', lastActive: 'Lab 4', expiryDate: '2026-05-30', registerDate: '2025-12-01' 
    },
    { 
      id: 'EXT-GST-08', firstName: 'Lisa', lastName: 'Black', phone: '090-999-9999', email: 'lisa@music.com', 
      company: 'VIP Guest', category: 'External', role: 'Guest', authMethod: 'Face Scan', 
      status: 'Active', lastActive: 'Executive Floor', expiryDate: '2026-01-26', registerDate: '2026-01-26' 
    },
    { 
      id: 'EXT-GST-09', firstName: 'สมชาย', lastName: 'เพื่อนพนักงาน', phone: '081-555-0000', email: '', 
      company: 'Personal', category: 'External', role: 'Guest', authMethod: 'Kiosk', 
      status: 'Pending', lastActive: 'Lobby', expiryDate: '2026-01-26', registerDate: '2026-01-26' 
    },
    { 
      id: 'EXT-GST-10', firstName: 'ทีมตรวจ', lastName: 'สอบบัญชี', phone: '02-999-8888', email: 'audit@kpmg.com', 
      company: 'KPMG', category: 'External', role: 'Guest', authMethod: 'ID Exchange', 
      status: 'Checked In', lastActive: 'Acc Room', expiryDate: '2026-02-15', registerDate: '2026-01-28' 
    },
    { 
      id: 'EXT-GST-11', firstName: 'ลูกค้า', lastName: 'VIP', phone: '099-888-7777', email: '', 
      company: 'Client A', category: 'External', role: 'Guest', authMethod: 'Line OA', 
      status: 'Checked Out', lastActive: 'Showroom', expiryDate: '2026-01-26', registerDate: '2026-01-26' 
    }
  ];
  ngOnInit() {}

  // Filter Logic
  get filteredUsers() {
    if (this.selectedCategory === 'All') return this.allUsers;
    return this.allUsers.filter(user => user.category === this.selectedCategory);
  }

  setCategory(category: string) {
    this.selectedCategory = category;
  }

  getCount(category: string): number {
    if (category === 'All') return this.allUsers.length;
    return this.allUsers.filter(u => u.category === category).length;
  }

  // Helper: Role Color
  // Return undefined for Hybrid so we can custom style it in HTML
  getRoleSeverity(role: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (role) {
      case 'Super Admin': 
      case 'Admin': return 'primary' as any;
      case 'Security': return 'contrast';
      case 'Employee': return 'info';
      
      // Hybrid Roles: Return undefined to use custom CSS
      case 'Hybrid Tech': 
      case 'Consultant': return undefined; 
      
      case 'Technician': 
      case 'Contractor': return 'warning';
      case 'Messenger': return 'secondary';
      case 'Guest': return 'success';
      default: return 'secondary';
    }
  }

  // Helper: Auth Icon
  getAuthIcon(method: string): string {
    if (method.includes('Kiosk')) return 'pi pi-desktop';
    if (method.includes('Line OA') || method === 'System' || method.includes('App')) return 'pi pi-mobile';
    if (method === 'Face Scan') return 'pi pi-face-smile';
    if (method.includes('ID Exchange') || method.includes('Card')) return 'pi pi-id-card';
    return 'pi pi-cog';
  }

  getStatusColor(status: string): string {
    switch(status) {
        case 'Active': return 'text-green-600 font-bold';
        case 'Checked In': return 'text-blue-600 font-bold';
        case 'Checked Out': return 'text-gray-500';
        case 'Pending': return 'text-orange-500 font-bold';
        case 'Blacklist': return 'text-red-600 font-bold line-through';
        default: return 'text-gray-700';
    }
  }

  isExpired(dateString: string | null): boolean {
    if (!dateString) return false;
    const exp = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    return exp < today;
  }
}