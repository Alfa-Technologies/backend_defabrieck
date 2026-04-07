import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { DefectTypesService } from './defect-types.service';
import { DefectType } from './entities/defect-type.entity';
import { CreateDefectTypeInput, UpdateDefectTypeInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Resolver(() => DefectType)
export class DefectTypesResolver {
  constructor(private readonly defectTypesService: DefectTypesService) {}

  @Mutation(() => DefectType, { name: 'createDefectType' })
  createDefectType(
    @Args('createDefectTypeInput') createInput: CreateDefectTypeInput,
  ): Promise<DefectType> {
    return this.defectTypesService.create(createInput);
  }

  @Query(() => [DefectType], { name: 'defectTypes' })
  findAll(
    @Args() paginationArgs: PaginationArgs,
    @Args('partId', { type: () => String, nullable: true }) partId?: string,
  ): Promise<DefectType[]> {
    return this.defectTypesService.findAll(paginationArgs, partId);
  }

  @Query(() => DefectType, { name: 'defectType' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<DefectType> {
    return this.defectTypesService.findOne(id);
  }

  @Mutation(() => DefectType, { name: 'updateDefectType' })
  updateDefectType(
    @Args('updateDefectTypeInput') updateInput: UpdateDefectTypeInput,
  ): Promise<DefectType> {
    return this.defectTypesService.update(updateInput.id, updateInput);
  }

  @Mutation(() => DefectType, { name: 'removeDefectType' })
  removeDefectType(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<DefectType> {
    return this.defectTypesService.remove(id, isActive);
  }
}
