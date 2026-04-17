import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersResolver } from './purchase-orders.resolver';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder])],
  providers: [PurchaseOrdersResolver, PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
