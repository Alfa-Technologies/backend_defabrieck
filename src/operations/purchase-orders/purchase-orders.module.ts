import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyContactsModule } from '../../crm/company-contacts/company-contacts.module';
import { QuotesModule } from '../quotes/quotes.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

import { PurchaseOrdersService } from './purchase-orders.service';
import {
  PurchaseOrdersResolver,
  LinkedQuoteResolver,
  LinkedInvoiceResolver,
} from './purchase-orders.resolver';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrdersLoader } from './purchase-orders.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, CompanyContact, Quote, Invoice]),
    CompanyContactsModule,
    QuotesModule,
    forwardRef(() => InvoicesModule),
  ],
  providers: [
    PurchaseOrdersResolver,
    PurchaseOrdersService,
    PurchaseOrdersLoader,
    LinkedQuoteResolver,
    LinkedInvoiceResolver,
  ],
  exports: [PurchaseOrdersService, PurchaseOrdersLoader],
})
export class PurchaseOrdersModule {}
