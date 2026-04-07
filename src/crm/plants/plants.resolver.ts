import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { Plant } from './entities/plant.entity';
import { CreatePlantInput, UpdatePlantInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Company } from '../companies/entities/company.entity';
import { PlantsLoader } from './plants.loader';

@Resolver(() => Plant)
export class PlantsResolver {
  constructor(
    private readonly plantsService: PlantsService,
    private readonly plantsLoader: PlantsLoader,
  ) {}

  @Mutation(() => Plant, { name: 'createPlant' })
  createPlant(
    @Args('createPlantInput') createPlantInput: CreatePlantInput,
  ): Promise<Plant> {
    return this.plantsService.create(createPlantInput);
  }

  @Query(() => [Plant], { name: 'plants' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Plant[]> {
    return this.plantsService.findAll(paginationArgs);
  }

  @Query(() => Plant, { name: 'plant' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Plant> {
    return this.plantsService.findOne(id);
  }

  @ResolveField(() => Company, { nullable: true })
  async company(@Parent() plant: Plant): Promise<Company | null> {
    if (!plant.companyId) {
      return null;
    }
    return this.plantsLoader.batchCompany.load(plant.companyId);
  }

  @Mutation(() => Plant, { name: 'updatePlant' })
  updatePlant(
    @Args('updatePlantInput') updatePlantInput: UpdatePlantInput,
  ): Promise<Plant> {
    return this.plantsService.update(updatePlantInput.id, updatePlantInput);
  }

  @Mutation(() => Plant, { name: 'removePlant' })
  removePlant(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<Plant> {
    return this.plantsService.remove(id, isActive);
  }
}
