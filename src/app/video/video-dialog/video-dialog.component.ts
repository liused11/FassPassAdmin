import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Video } from '../../service/video.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-dialog',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <p-card *ngIf="video" [subheader]="video.genres">
      <img [src]="video.image" alt="{{ video.title }}" class="w-full mb-3" />
      <p>{{ video.description }}</p>
      <p><strong>Category:</strong> {{ video.category }}</p>
      <p><strong>Rating:</strong> ⭐ {{ video.rating }}</p>

      <div class="flex gap-2 mt-3">

        

        <button pButton label="Close" (click)="ref.close()" class="p-button-secondary"></button>
      </div>
    </p-card>
  `
})
export class VideoDialogComponent implements OnInit {
  video!: Video;

  constructor(
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.config.data) {
      this.video = this.config.data as Video;
    }
  }

  openVideoById(id: number) {
    this.router.navigate([], {
      queryParams: { videoId: id },
      queryParamsHandling: 'merge'
    });
  }

  openChatById(id: number) {
    this.router.navigate([], {
      queryParams: { chatId: id },
      queryParamsHandling: 'merge'
    });
  }
}
