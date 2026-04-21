import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DataLoader from 'dataloader';

import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';

@Injectable({ scope: Scope.REQUEST })
export class InvoicesLoader {
  constructor(
    @InjectRepository(CompanyContact)
    private readonly contactRepository: Repository<CompanyContact>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
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

  public readonly batchPurchaseOrders = new DataLoader<
    string,
    PurchaseOrder | null
  >(async (poIds: readonly string[]) => {
    const purchaseOrders = await this.poRepository.find({
      where: { id: In([...poIds]) },
    });

    const poMap = new Map(purchaseOrders.map((po) => [po.id, po]));
    return poIds.map((id) => poMap.get(id) || null);
  });
}
