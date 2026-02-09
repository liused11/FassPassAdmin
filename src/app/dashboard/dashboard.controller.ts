// app/dashboard/dashboard.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Endpoint: GET http://localhost:3000/dashboard/metrics
  @Get('metrics')
  async getMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }

  // Endpoint: GET http://localhost:3000/dashboard/activities
  @Get('activities')
  async getActivities() {
    return this.dashboardService.getAllActivities();
  }
}