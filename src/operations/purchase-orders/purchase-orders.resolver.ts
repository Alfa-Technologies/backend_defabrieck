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

import { PurchaseOrdersService } from './purchase-orders.service';
import {
  PurchaseOrder,
  LinkedQuoteType,
  LinkedInvoiceType,
} from './entities/purchase-order.entity';
import { CreatePurchaseOrderInput, UpdatePurchaseOrderInput } from './dto';

import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { CompanyContactsService } from '../../crm/company-contacts/company-contacts.service';

import { Quote } from '../quotes/entities/quote.entity';
import { QuotesService } from '../quotes/quotes.service';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoicesService } from '../invoices/invoices.service';

@Resolver(() => PurchaseOrder)
export class PurchaseOrdersResolver {
  constructor(
    private readonly poService: PurchaseOrdersService,
    private readonly contactsService: CompanyContactsService,
  ) {}

  @Mutation(() => PurchaseOrder, { name: 'createPurchaseOrder' })
  createPurchaseOrder(
    @Args('createPurchaseOrderInput') createPoInput: CreatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    return this.poService.create(createPoInput);
  }

  @Query(() => [PurchaseOrder], { name: 'purchaseOrders' })
  findAll(): Promise<PurchaseOrder[]> {
    return this.poService.findAll();
  }

  @Query(() => PurchaseOrder, { name: 'purchaseOrder' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<PurchaseOrder> {
    return this.poService.findOne(id);
  }

  @Mutation(() => PurchaseOrder, { name: 'updatePurchaseOrder' })
  updatePurchaseOrder(
    @Args('updatePurchaseOrderInput') updatePoInput: UpdatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    return this.poService.update(updatePoInput.id, updatePoInput);
  }

  @Mutation(() => Boolean, { name: 'removePurchaseOrder' })
  removePurchaseOrder(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    return this.poService.remove(id);
  }

  @ResolveField(() => CompanyContact, { nullable: true })
  async contact(@Parent() po: PurchaseOrder): Promise<CompanyContact | null> {
    if (!po.contactId) return null;
    return this.contactsService.findOne(po.contactId);
  }
}

@Resolver(() => LinkedQuoteType)
export class LinkedQuoteResolver {
  constructor(private readonly quotesService: QuotesService) {}

  @ResolveField(() => Quote, { nullable: true })
  async quote(@Parent() parent: LinkedQuoteType): Promise<Quote | null> {
    if (!parent.quoteId) return null;
    return this.quotesService.findQuoteById(parent.quoteId);
  }
}

@Resolver(() => LinkedInvoiceType)
export class LinkedInvoiceResolver {
  constructor(
    @Inject(forwardRef(() => InvoicesService))
    private readonly invoicesService: InvoicesService,
  ) {}

  @ResolveField(() => Invoice, { nullable: true })
  async invoice(@Parent() parent: LinkedInvoiceType): Promise<Invoice | null> {
    if (!parent.invoiceId) return null;
    return this.invoicesService.findOne(parent.invoiceId);
  }
}
