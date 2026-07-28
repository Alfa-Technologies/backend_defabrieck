import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
} from '@nestjs/graphql';
import { PositionsService } from './positions.service';
import { Position } from './entities/position.entity';
import { CreatePositionInput, UpdatePositionInput } from './dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Resolver(() => Position)
export class PositionsResolver {
  constructor(
    private readonly positionsService: PositionsService,
  ) {}

  @Mutation(() => Position, { name: 'createPosition' })
  createPosition(
    @Args('createPositionInput') createPositionInput: CreatePositionInput,
  ): Promise<Position> {
    return this.positionsService.create(createPositionInput);
  }

  @Query(() => [Position], { name: 'positions' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Position[]> {
    return this.positionsService.findAll(paginationArgs);
  }

  @Query(() => Position, { name: 'position' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Position> {
    return this.positionsService.findOne(id);
  }

  @Mutation(() => Position, { name: 'updatePosition' })
  updatePosition(
    @Args('updatePositionInput') updatePositionInput: UpdatePositionInput,
  ): Promise<Position> {
    return this.positionsService.update(
      updatePositionInput.id,
      updatePositionInput,
    );
  }

  @Mutation(() => Position, { name: 'removePosition' })
  removePosition(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<Position> {
    return this.positionsService.remove(id, isActive);
  }
}
