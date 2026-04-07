import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { LotsService } from './lots.service';
import { Lot } from './entities/lot.entity';
import { CreateLotInput, UpdateLotInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Resolver(() => Lot)
export class LotsResolver {
  constructor(private readonly lotsService: LotsService) {}

  @Mutation(() => Lot, { name: 'createLot' })
  createLot(@Args('createLotInput') createInput: CreateLotInput): Promise<Lot> {
    return this.lotsService.create(createInput);
  }

  @Query(() => [Lot], { name: 'lots' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Lot[]> {
    return this.lotsService.findAll(paginationArgs);
  }

  @Query(() => Lot, { name: 'lot' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Lot> {
    return this.lotsService.findOne(id);
  }

  @Mutation(() => Lot, { name: 'updateLot' })
  updateLot(@Args('updateLotInput') updateInput: UpdateLotInput): Promise<Lot> {
    return this.lotsService.update(updateInput.id, updateInput);
  }

  @Mutation(() => Lot, { name: 'removeLot' })
  removeLot(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<Lot> {
    return this.lotsService.remove(id, isActive);
  }
}
