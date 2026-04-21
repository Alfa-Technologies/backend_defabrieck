import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

import { PurchaseOrdersService } from './purchase-orders.service';
import {
  PurchaseOrder,
  LinkedQuoteType,
  LinkedInvoiceType,
} from './entities/purchase-order.entity';
import { CreatePurchaseOrderInput, UpdatePurchaseOrderInput } from './dto';

import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { PurchaseOrdersLoader } from './purchase-orders.loader';

import { Quote } from '../quotes/entities/quote.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Resolver(() => PurchaseOrder)
export class PurchaseOrdersResolver {
  constructor(
    private readonly poService: PurchaseOrdersService,
    private readonly poLoader: PurchaseOrdersLoader,
  ) {}

  @Mutation(() => PurchaseOrder, { name: 'createPurchaseOrder' })
  @UseGuards(JwtAuthGuard)
  createPurchaseOrder(
    @Args('createPurchaseOrderInput') createPoInput: CreatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    return this.poService.create(createPoInput);
  }

  @Query(() => [PurchaseOrder], { name: 'purchaseOrders' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<PurchaseOrder[]> {
    return this.poService.findAll(paginationArgs);
  }

  @Query(() => PurchaseOrder, { name: 'purchaseOrder' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<PurchaseOrder> {
    return this.poService.findOne(id);
  }

  @Mutation(() => PurchaseOrder, { name: 'updatePurchaseOrder' })
  @UseGuards(JwtAuthGuard)
  updatePurchaseOrder(
    @Args('updatePurchaseOrderInput') updatePoInput: UpdatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    return this.poService.update(updatePoInput.id, updatePoInput);
  }

  @Mutation(() => PurchaseOrder, { name: 'changePurchaseOrderStatus' })
  @UseGuards(JwtAuthGuard)
  changePurchaseOrderStatus(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<PurchaseOrder> {
    return this.poService.changeStatus(id, isActive);
  }

  @ResolveField(() => CompanyContact, { nullable: true })
  async contact(@Parent() po: PurchaseOrder): Promise<CompanyContact | null> {
    if (!po.contactId) return null;
    return this.poLoader.batchContacts.load(po.contactId);
  }
}

@Resolver(() => LinkedQuoteType)
export class LinkedQuoteResolver {
  constructor(private readonly poLoader: PurchaseOrdersLoader) {}

  @ResolveField(() => Quote, { nullable: true })
  async quote(@Parent() parent: LinkedQuoteType): Promise<Quote | null> {
    if (!parent.quoteId) return null;
    return this.poLoader.batchQuotes.load(parent.quoteId);
  }
}

@Resolver(() => LinkedInvoiceType)
export class LinkedInvoiceResolver {
  constructor(private readonly poLoader: PurchaseOrdersLoader) {}

  @ResolveField(() => Invoice, { nullable: true })
  async invoice(@Parent() parent: LinkedInvoiceType): Promise<Invoice | null> {
    if (!parent.invoiceId) return null;
    return this.poLoader.batchInvoices.load(parent.invoiceId);
  }
}
