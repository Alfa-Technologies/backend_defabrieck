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
import { PartCatalogService } from './part-catalog.service';
import { PartCatalog } from './entities/part-catalog.entity';
import { CreatePartCatalogInput, UpdatePartCatalogInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Company } from '../../crm/companies/entities/company.entity';
import { DefectType } from '../defect-types/entities/defect-type.entity';
import { PartCatalogLoader } from './part-catalog.loader';

@Resolver(() => PartCatalog)
export class PartCatalogResolver {
  constructor(
    private readonly partCatalogService: PartCatalogService,
    private readonly partCatalogLoader: PartCatalogLoader,
  ) {}

  @Mutation(() => PartCatalog, { name: 'createPartCatalog' })
  createPartCatalog(
    @Args('createPartCatalogInput') createInput: CreatePartCatalogInput,
  ): Promise<PartCatalog> {
    return this.partCatalogService.create(createInput);
  }

  @Query(() => [PartCatalog], { name: 'partCatalogs' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<PartCatalog[]> {
    return this.partCatalogService.findAll(paginationArgs);
  }

  @Query(() => PartCatalog, { name: 'partCatalog' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<PartCatalog> {
    return this.partCatalogService.findOne(id);
  }

  @Mutation(() => PartCatalog, { name: 'updatePartCatalog' })
  updatePartCatalog(
    @Args('updatePartCatalogInput') updateInput: UpdatePartCatalogInput,
  ): Promise<PartCatalog> {
    return this.partCatalogService.update(updateInput.id, updateInput);
  }

  @Mutation(() => PartCatalog, { name: 'removePartCatalog' })
  removePartCatalog(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<PartCatalog> {
    return this.partCatalogService.remove(id, isActive);
  }

  @ResolveField(() => Company, { nullable: true })
  async customer(@Parent() part: PartCatalog): Promise<Company | null> {
    if (!part.customerId) {
      return null;
    }
    return this.partCatalogLoader.batchCompany.load(part.customerId);
  }

  @ResolveField(() => [DefectType])
  async defectTypes(@Parent() part: PartCatalog): Promise<DefectType[]> {
    return this.partCatalogLoader.batchDefectTypes.load(part.id);
  }
}
