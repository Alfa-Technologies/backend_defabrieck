import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyContactsModule } from '../../crm/company-contacts/company-contacts.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';

import { InvoicesService } from './invoices.service';
import { InvoicesResolver, LinkedInvoicePoResolver } from './invoices.resolver';
import { Invoice } from './entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    CompanyContactsModule,
    forwardRef(() => PurchaseOrdersModule),
  ],
  providers: [InvoicesResolver, InvoicesService, LinkedInvoicePoResolver],
  exports: [InvoicesService],
})
export class InvoicesModule {}
