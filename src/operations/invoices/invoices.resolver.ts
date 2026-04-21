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

import { InvoicesService } from './invoices.service';
import { Invoice, LinkedInvoicePoType } from './entities/invoice.entity';
import { CreateInvoiceInput, UpdateInvoiceInput } from './dto';

import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { InvoicesLoader } from './invoices.loader';

import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';

@Resolver(() => Invoice)
export class InvoicesResolver {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly invoicesLoader: InvoicesLoader,
  ) {}

  @Mutation(() => Invoice, { name: 'createInvoice' })
  @UseGuards(JwtAuthGuard)
  createInvoice(
    @Args('createInvoiceInput') createInvoiceInput: CreateInvoiceInput,
  ): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceInput);
  }

  @Query(() => [Invoice], { name: 'invoices' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Invoice[]> {
    return this.invoicesService.findAll(paginationArgs);
  }

  @Query(() => Invoice, { name: 'invoice' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Mutation(() => Invoice, { name: 'updateInvoice' })
  @UseGuards(JwtAuthGuard)
  updateInvoice(
    @Args('updateInvoiceInput') updateInvoiceInput: UpdateInvoiceInput,
  ): Promise<Invoice> {
    return this.invoicesService.update(updateInvoiceInput);
  }

  @Mutation(() => Invoice, { name: 'changeInvoiceStatus' })
  @UseGuards(JwtAuthGuard)
  changeInvoiceStatus(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<Invoice> {
    return this.invoicesService.changeStatus(id, isActive);
  }

  @ResolveField(() => CompanyContact, { nullable: true })
  async contact(@Parent() invoice: Invoice): Promise<CompanyContact | null> {
    if (!invoice.contactId) return null;
    return this.invoicesLoader.batchContacts.load(invoice.contactId);
  }
}

@Resolver(() => LinkedInvoicePoType)
export class LinkedInvoicePoResolver {
  constructor(private readonly invoicesLoader: InvoicesLoader) {}

  @ResolveField(() => PurchaseOrder, { nullable: true })
  async purchaseOrder(
    @Parent() parent: LinkedInvoicePoType,
  ): Promise<PurchaseOrder | null> {
    if (!parent.poId) return null;
    return this.invoicesLoader.batchPurchaseOrders.load(parent.poId);
  }
}
