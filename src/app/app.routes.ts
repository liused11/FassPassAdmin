// app.routes
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatComponent } from './chat/chat.component';
import { InboxComponent } from './inbox/inbox.component';
import { InboxListComponent } from './inbox/inboxlist/inboxlist.component'; // Import the subcomponent
import { CustomerComponent } from './customer/customer.component';
import { CardComponent } from './card/card.component';
import { VideoComponent } from './video/video.component';
import { StarComponent } from './inbox/star/star.component';
import { FloorPlanViewerComponent } from './floor-plan-viewer.componentfloor-plan-viewer/floor-plan-viewer/floor-plan-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'chat', component: ChatComponent },
  {
    path: 'buildings',
    component: InboxComponent,
    children: [
      { path: '', component: InboxListComponent },      // <-- default child route
      { path: 'list', component: InboxListComponent },
      { path: 'star', component: StarComponent }
    ]
  },
  {
    path: 'zones',
    component: InboxComponent,
    children: [
      { path: '', component: InboxListComponent },
      { path: 'list', component: InboxListComponent },
      { path: 'star', component: StarComponent }
    ]
  },
  { path: 'customer', component: CustomerComponent },
  { path: 'reserve', component: CardComponent },
  { path: 'video', component: VideoComponent },
  { path: 'fp', component: FloorPlanViewerComponent },
  {
    path: 'parking',
    loadComponent: () => import('./parking/parking-management/parking-management.component').then(m => m.ParkingManagementComponent)
  }
];

