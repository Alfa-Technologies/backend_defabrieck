import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';

import { SettlementsService } from './settlements.service';
import { Settlement } from './entities/settlement.entity';
import { CreateSettlementInput, UpdateSettlementInput } from './dto';

@Resolver(() => Settlement)
export class SettlementsResolver {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Mutation(() => Settlement, { name: 'createSettlement' })
  createSettlement(
    @Args('createSettlementInput') createSettlementInput: CreateSettlementInput,
  ): Promise<Settlement> {
    return this.settlementsService.create(createSettlementInput);
  }

  @Query(() => [Settlement], { name: 'settlements' })
  findAll(): Promise<Settlement[]> {
    return this.settlementsService.findAll();
  }

  @Query(() => Settlement, { name: 'settlement' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Settlement> {
    return this.settlementsService.findOne(id);
  }

  @Mutation(() => Settlement, { name: 'updateSettlement' })
  updateSettlement(
    @Args('updateSettlementInput') updateSettlementInput: UpdateSettlementInput,
  ): Promise<Settlement> {
    return this.settlementsService.update(updateSettlementInput);
  }

  @Mutation(() => Boolean, { name: 'removeSettlement' })
  removeSettlement(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    return this.settlementsService.remove(id);
  }
}
