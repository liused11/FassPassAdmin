// app/dashboard/dashboard.controller.ts
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from '../service/dashboard.service';
import { registerLocaleData } from '@angular/common';
import localeTh from '@angular/common/locales/th';

registerLocaleData(localeTh);

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}