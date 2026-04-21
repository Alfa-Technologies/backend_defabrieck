import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyContactsModule } from '../../crm/company-contacts/company-contacts.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';

import { InvoicesService } from './invoices.service';
import { InvoicesResolver, LinkedInvoicePoResolver } from './invoices.resolver';
import { Invoice } from './entities/invoice.entity';
import { InvoicesLoader } from './invoices.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, CompanyContact, PurchaseOrder]),
    CompanyContactsModule,
    forwardRef(() => PurchaseOrdersModule),
  ],
  providers: [
    InvoicesResolver,
    InvoicesService,
    InvoicesLoader,
    LinkedInvoicePoResolver,
  ],
  exports: [InvoicesService, InvoicesLoader],
})
export class InvoicesModule {}
