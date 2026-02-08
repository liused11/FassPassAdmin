import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Customer } from '../../service/user-info.service'; // <-- import Customer
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info-modal',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <p-card *ngIf="customer" [subheader]="customer.title + ' at ' + customer.company">
      <!-- Avatar -->
      <img 
        [src]="customer.avatar" 
        alt="{{ customer.name }}" 
        class="w-full mb-3 rounded-lg shadow-md"
        style="min-width: 120px; max-width: 200px; margin: 0 auto; display: block;"
      />

      <!-- Info -->
      <h2 class="text-xl font-bold mb-2 text-center">{{ customer.name }}</h2>
      <p class="text-center text-gray-600"><strong>Email:</strong> {{ customer.email }}</p>
      <p class="text-center"><strong>Lead Source:</strong> {{ customer.leadSource }}</p>
      <p class="text-center"><strong>Status:</strong> {{ customer.status }}</p>
      <p class="text-center"><strong>Online:</strong> {{ customer.online ? 'Yes' : 'No' }}</p>

      <!-- Actions -->
      <div class="flex gap-2 mt-3 justify-center">
        <button 
          pButton 
          label="Close" 
          class="p-button-secondary"
          (click)="ref.close()">
        </button>
      </div>
    </p-card>
  `,
})
export class UserInfoModalComponent implements OnInit {
  customer: Customer | null = null;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {}

  ngOnInit(): void {
    this.customer = this.config.data?.customer ?? null;
  }
}
