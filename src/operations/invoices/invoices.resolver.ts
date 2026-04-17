import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';

import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceInput, UpdateInvoiceInput } from './dto';

@Resolver(() => Invoice)
export class InvoicesResolver {
  constructor(private readonly invoicesService: InvoicesService) {}

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
}
