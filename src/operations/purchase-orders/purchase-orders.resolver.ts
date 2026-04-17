import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';

import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { CreatePurchaseOrderInput, UpdatePurchaseOrderInput } from './dto';

@Resolver(() => PurchaseOrder)
export class PurchaseOrdersResolver {
  constructor(private readonly poService: PurchaseOrdersService) {}

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
}
