import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { DockModule } from 'primeng/dock';
import { InputTextModule } from 'primeng/inputtext';
import { CarouselModule } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { TabMenuModule } from 'primeng/tabmenu';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';

import { MenuItem } from 'primeng/api';
import { VideoService, Video } from '../service/video.service';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DockModule,
    InputTextModule,
    CarouselModule,
    CardModule,
    TabMenuModule,
    AvatarModule,
    AvatarGroupModule,
    ButtonModule
  ],
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent {
  keepWatching: Video[] = [];
  popular: Video[] = [];
  categories: MenuItem[] = [
    { label: 'Popular' },
    { label: 'New Releases' },
    { label: 'Recently Added' },
    { label: 'For you' }
  ];
  activeCategory: MenuItem = this.categories[0];

  constructor(
    private videoService: VideoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.keepWatching = this.videoService.getKeepWatching();
    this.popular = this.videoService.getPopular();
  }

  // ✅ Just update query params when clicking a video
  goToVideo(video: Video) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { videoId: video.id },
      queryParamsHandling: 'merge'
    });
  }
}
