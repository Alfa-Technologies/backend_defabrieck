import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyContactsModule } from '../../crm/company-contacts/company-contacts.module';
import { QuotesModule } from '../quotes/quotes.module';
import { InvoicesModule } from '../invoices/invoices.module';

import { PurchaseOrdersService } from './purchase-orders.service';
import {
  PurchaseOrdersResolver,
  LinkedQuoteResolver,
  LinkedInvoiceResolver,
} from './purchase-orders.resolver';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder]),
    CompanyContactsModule,
    QuotesModule,
    forwardRef(() => InvoicesModule),
  ],
  providers: [
    PurchaseOrdersResolver,
    PurchaseOrdersService,
    LinkedQuoteResolver,
    LinkedInvoiceResolver,
  ],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
