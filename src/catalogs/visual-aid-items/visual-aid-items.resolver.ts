import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { VisualAidItemsService } from './visual-aid-items.service';
import { VisualAidItem } from './entities/visual-aid-item.entity';
import { CreateVisualAidItemInput, UpdateVisualAidItemInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { DefectType } from '../defect-types/entities/defect-type.entity';
import { VisualAidDocument } from '../visual-aid-documents/entities/visual-aid-document.entity';
import { VisualAidItemsLoader } from './visual-aid-items.loader';

@Resolver(() => VisualAidItem)
export class VisualAidItemsResolver {
  constructor(
    private readonly itemsService: VisualAidItemsService,
    private readonly visualAidItemsLoader: VisualAidItemsLoader,
  ) {}

  @Mutation(() => VisualAidItem, { name: 'createVisualAidItem' })
  createVisualAidItem(
    @Args('createVisualAidItemInput') createInput: CreateVisualAidItemInput,
  ): Promise<VisualAidItem> {
    return this.itemsService.create(createInput);
  }

  @Query(() => [VisualAidItem], { name: 'visualAidItems' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<VisualAidItem[]> {
    return this.itemsService.findAll(paginationArgs);
  }

  @Query(() => VisualAidItem, { name: 'visualAidItem' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<VisualAidItem> {
    return this.itemsService.findOne(id);
  }

  @Mutation(() => VisualAidItem, { name: 'updateVisualAidItem' })
  updateVisualAidItem(
    @Args('updateVisualAidItemInput') updateInput: UpdateVisualAidItemInput,
  ): Promise<VisualAidItem> {
    return this.itemsService.update(updateInput.id, updateInput);
  }

  @Mutation(() => VisualAidItem, { name: 'removeVisualAidItem' })
  removeVisualAidItem(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<VisualAidItem> {
    return this.itemsService.remove(id, isActive);
  }

  @ResolveField(() => DefectType, { nullable: true })
  async defectType(@Parent() item: VisualAidItem): Promise<DefectType | null> {
    if (!item.defectTypeId) {
      return null;
    }
    return this.visualAidItemsLoader.batchDefectTypes.load(item.defectTypeId);
  }

  @ResolveField(() => VisualAidDocument, { nullable: true })
  async visualAidDocument(
    @Parent() item: VisualAidItem,
  ): Promise<VisualAidDocument | null> {
    if (!item.visualAidDocumentId) {
      return null;
    }
    return this.visualAidItemsLoader.batchVisualAidDocuments.load(
      item.visualAidDocumentId,
    );
  }
}
