import { Module } from '@nestjs/common';
import { ProductionDashboardService } from './production-dashboard.service';
import { ProductionDashboardResolver } from './production-dashboard.resolver';

@Module({
  providers: [ProductionDashboardService, ProductionDashboardResolver],
  exports: [ProductionDashboardService],
})
export class ProductionDashboardModule {}
