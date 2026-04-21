import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DataLoader from 'dataloader';

import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable({ scope: Scope.REQUEST })
export class PurchaseOrdersLoader {
  constructor(
    @InjectRepository(CompanyContact)
    private readonly contactRepository: Repository<CompanyContact>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  public readonly batchContacts = new DataLoader<string, CompanyContact | null>(
    async (contactIds: readonly string[]) => {
      const contacts = await this.contactRepository.find({
        where: { id: In([...contactIds]) },
      });

      const contactMap = new Map(
        contacts.map((contact) => [contact.id, contact]),
      );
      return contactIds.map((id) => contactMap.get(id) || null);
    },
  );

  public readonly batchQuotes = new DataLoader<string, Quote | null>(
    async (quoteIds: readonly string[]) => {
      const quotes = await this.quoteRepository.find({
        where: { id: In([...quoteIds]) },
      });

      const quoteMap = new Map(quotes.map((quote) => [quote.id, quote]));
      return quoteIds.map((id) => quoteMap.get(id) || null);
    },
  );

  public readonly batchInvoices = new DataLoader<string, Invoice | null>(
    async (invoiceIds: readonly string[]) => {
      const invoices = await this.invoiceRepository.find({
        where: { id: In([...invoiceIds]) },
      });

      const invoiceMap = new Map(
        invoices.map((invoice) => [invoice.id, invoice]),
      );
      return invoiceIds.map((id) => invoiceMap.get(id) || null);
    },
  );
}
