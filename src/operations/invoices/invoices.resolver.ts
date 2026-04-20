import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ParseUUIDPipe, Inject, forwardRef } from '@nestjs/common';

import { InvoicesService } from './invoices.service';
import { Invoice, LinkedInvoicePoType } from './entities/invoice.entity';
import { CreateInvoiceInput, UpdateInvoiceInput } from './dto';

import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { CompanyContactsService } from '../../crm/company-contacts/company-contacts.service';

import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';

@Resolver(() => Invoice)
export class InvoicesResolver {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly contactsService: CompanyContactsService,
  ) {}

  @Mutation(() => Invoice, { name: 'createInvoice' })
  createInvoice(
    @Args('createInvoiceInput') createInvoiceInput: CreateInvoiceInput,
  ): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceInput);
  }

  @Query(() => [Invoice], { name: 'invoices' })
  findAll(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Query(() => Invoice, { name: 'invoice' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Mutation(() => Invoice, { name: 'updateInvoice' })
  updateInvoice(
    @Args('updateInvoiceInput') updateInvoiceInput: UpdateInvoiceInput,
  ): Promise<Invoice> {
    return this.invoicesService.update(updateInvoiceInput);
  }

  @Mutation(() => Boolean, { name: 'removeInvoice' })
  removeInvoice(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    return this.invoicesService.remove(id);
  }

  @ResolveField(() => CompanyContact, { nullable: true })
  async contact(@Parent() invoice: Invoice): Promise<CompanyContact | null> {
    if (!invoice.contactId) return null;
    return this.contactsService.findOne(invoice.contactId);
  }
}

@Resolver(() => LinkedInvoicePoType)
export class LinkedInvoicePoResolver {
  constructor(
    @Inject(forwardRef(() => PurchaseOrdersService))
    private readonly poService: PurchaseOrdersService,
  ) {}

  @ResolveField(() => PurchaseOrder, { nullable: true })
  async purchaseOrder(
    @Parent() parent: LinkedInvoicePoType,
  ): Promise<PurchaseOrder | null> {
    if (!parent.poId) return null;
    return this.poService.findOne(parent.poId);
  }
}
