// parking-edit-sidebar.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DividerModule } from 'primeng/divider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { ParkingEditSidebarModel } from '../../models/parking-edit-sidebar.model';
import { SlotManagerComponent } from '../inbox-slot-manager/slot-manager.component';
import { createClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-parking-edit-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarModule,
    ButtonModule,
    InputTextModule,
    SkeletonModule,
    InputTextarea,
    InputNumberModule,
    DropdownModule,
    ToggleButtonModule,
    DividerModule,
    SelectButtonModule,
    InputSwitchModule,
    CheckboxModule,
    DrawerModule,
    SlotManagerComponent
  ],
  templateUrl: './parking-edit-sidebar.component.html',
  styleUrls: ['./parking-edit-sidebar.component.css']
})
export class ParkingEditSidebarComponent implements OnChanges {

  supabase = createClient(
    'https://unxcjdypaxxztywplqdv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA'
  );

  @Input() visible = false;
  @Input() data!: ParkingEditSidebarModel | null;
  @Input() loading: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<any>();
  @Input() token!: string;

  form!: FormGroup;

  /*vehicleOptions = [
    { label: 'รถยนต์', value: 'car' },
    { label: 'รถยนต์ EV', value: 'ev' },
    { label: 'รถจักรยานยนต์', value: 'motorcycle' }
  ];*/

  timeOptions = this.generateTimeOptions();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [null], 
      name: ['', Validators.required],
      address: [''],
      images: this.fb.control<string[]>([]),
      isActive: [true],

      openTime: ['', Validators.required],
      closeTime: ['', Validators.required],

      // 1. เปลี่ยนจาก hourlyRate เป็น role_prices (Group)
      role_prices: this.fb.group({
        Host: [0, [Validators.required, Validators.min(0)]],
        User: [0, [Validators.required, Validators.min(0)]],
        Visitor: [0, [Validators.required, Validators.min(0)]]
      })
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data && this.visible) {
      console.log(this.data); // 👈 ดูก่อน
      const data = this.data;
      this.form.reset({
        id: null,
        name: '',
        address: '',
        images: [],
        isActive: false,   // 👈 ใส่ default boolean ชัด ๆ
        openTime: '',
        closeTime: '',
        role_prices: {
          Host: 0,
          User: 0,
          Visitor: 0
        }
      });
      this.form.patchValue({
        ...data,
        isActive: !!data.isActive,  // 👈 บังคับ boolean
        openTime: data.openTime?.slice(0, 5),
        closeTime: data.closeTime?.slice(0, 5),
        role_prices: {
          Host: data.role_prices?.Host ?? 0,
          User: data.role_prices?.User ?? 0,
          Visitor: data.role_prices?.Visitor ?? 0
        }
      });
    }
  }

  close() {
    this.form.reset();
    this.visible = false;
    this.visibleChange.emit(false);   // ✅ สำคัญมาก
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.value);
    this.visibleChange.emit(false);
  }

  private generateTimeOptions() {
    const times = [];
    for (let h = 0; h < 24; h++) {
      const hour = h.toString().padStart(2, '0');
      times.push({ label: `${hour}:00 น.`, value: `${hour}:00` });
    }
    return times;
  }

  addImage(url: string) {
    if (!url) return;

    const current = this.form.value.images ?? [];
    this.form.patchValue({
      images: [...current, url]
    });
  }

  removeImage(index: number) {
    const current = [...(this.form.value.images ?? [])];
    current.splice(index, 1);
    this.form.patchValue({ images: current });
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `buildings/${fileName}`;

    const { error } = await this.supabase.storage
      .from('parking-images')
      .upload(filePath, file, {
        upsert: false,
      });

    if (error) {
      console.error('Upload failed', error);
      return;
    }

    const { data } = this.supabase.storage
      .from('parking-images')
      .getPublicUrl(filePath);

    this.addImage(data.publicUrl);
  }

}
