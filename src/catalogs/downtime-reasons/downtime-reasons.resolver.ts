import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { DowntimeReasonsService } from './downtime-reasons.service';
import { DowntimeReason } from './entities/downtime-reason.entity';
import { CreateDowntimeReasonInput, UpdateDowntimeReasonInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Resolver(() => DowntimeReason)
export class DowntimeReasonsResolver {
  constructor(
    private readonly downtimeReasonsService: DowntimeReasonsService,
  ) {}

  @Mutation(() => DowntimeReason, { name: 'createDowntimeReason' })
  createDowntimeReason(
    @Args('createDowntimeReasonInput') createInput: CreateDowntimeReasonInput,
  ): Promise<DowntimeReason> {
    return this.downtimeReasonsService.create(createInput);
  }

  @Query(() => [DowntimeReason], { name: 'downtimeReasons' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<DowntimeReason[]> {
    return this.downtimeReasonsService.findAll(paginationArgs);
  }

  @Query(() => DowntimeReason, { name: 'downtimeReason' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<DowntimeReason> {
    return this.downtimeReasonsService.findOne(id);
  }

  @Mutation(() => DowntimeReason, { name: 'updateDowntimeReason' })
  updateDowntimeReason(
    @Args('updateDowntimeReasonInput') updateInput: UpdateDowntimeReasonInput,
  ): Promise<DowntimeReason> {
    return this.downtimeReasonsService.update(updateInput.id, updateInput);
  }

  @Mutation(() => DowntimeReason, { name: 'removeDowntimeReason' })
  removeDowntimeReason(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<DowntimeReason> {
    return this.downtimeReasonsService.remove(id, isActive);
  }
}
