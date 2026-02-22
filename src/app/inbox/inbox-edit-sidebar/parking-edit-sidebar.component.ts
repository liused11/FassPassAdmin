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
    DrawerModule
  ],
  templateUrl: './parking-edit-sidebar.component.html',
  styleUrls: ['./parking-edit-sidebar.component.css']
})
export class ParkingEditSidebarComponent implements OnChanges {

  @Input() visible = false;
  @Input() data!: ParkingEditSidebarModel | null;
  @Input() loading: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<any>();

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
      imageUrl: this.fb.control<string[]>([]),
      isActive: [true],

      openTime: ['', Validators.required],
      closeTime: ['', Validators.required],

      hourlyRate: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data && this.visible) {
      console.log(this.data); // 👈 ดูก่อน
      const data = this.data;
      this.form.reset();  
      this.form.patchValue({
        ...data,
        openTime: data.openTime?.slice(0, 5),
        closeTime: data.closeTime?.slice(0, 5),
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

}
