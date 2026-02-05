// src/app/services/user-info.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  avatar: string;
  title: string;
  company: string;
  email: string;
  leadSource: string;
  status: string;
  online: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  private customers: Customer[] = [
    { id: 1, name: 'Cody Fisher', avatar: 'https://i.pravatar.cc/40?img=1', title: 'Software Engineer', company: 'PrimeTek', email: 'cody@primetek.com', leadSource: 'LinkedIn', status: 'Active', online: true },
    { id: 2, name: 'PrimeTek Team', avatar: 'https://i.pravatar.cc/40?img=2', title: 'Team', company: 'PrimeTek', email: 'team@primetek.com', leadSource: 'Website', status: 'Active', online: true },
    { id: 3, name: 'Jerome Bell', avatar: 'https://i.pravatar.cc/40?img=3', title: 'Product Manager', company: 'PrimeTek', email: 'jerome@primetek.com', leadSource: 'Referral', status: 'Inactive', online: true },
    { id: 4, name: 'Courtney Henry', avatar: 'https://i.pravatar.cc/40?img=4', title: 'Designer', company: 'PrimeTek', email: 'courtney@primetek.com', leadSource: 'Website', status: 'Active', online: false },
    { id: 5, name: 'Theresa Webb', avatar: 'https://i.pravatar.cc/40?img=5', title: 'QA Engineer', company: 'PrimeTek', email: 'theresa@primetek.com', leadSource: 'LinkedIn', status: 'Active', online: true },
    { id: 6, name: 'Wade Warren', avatar: 'https://i.pravatar.cc/40?img=6', title: 'DevOps Engineer', company: 'PrimeTek', email: 'wade@primetek.com', leadSource: 'Referral', status: 'Inactive', online: false },
    { id: 7, name: 'Jenny Wilson', avatar: 'https://i.pravatar.cc/40?img=7', title: 'HR Manager', company: 'PrimeTek', email: 'jenny@primetek.com', leadSource: 'Website', status: 'Active', online: true },
    { id: 8, name: 'Kristin Watson', avatar: 'https://i.pravatar.cc/40?img=8', title: 'Marketing Specialist', company: 'PrimeTek', email: 'kristin@primetek.com', leadSource: 'LinkedIn', status: 'Inactive', online: false }
  ];

  private selectedCustomerSubject = new BehaviorSubject<Customer | null>(null);

  getCustomers(): Customer[] {
    return this.customers;
  }

  selectCustomer(customer: Customer) {
    this.selectedCustomerSubject.next(customer);
  }

  getSelectedCustomer(): Observable<Customer | null> {
    return this.selectedCustomerSubject.asObservable();
  }
}
