import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { Shift } from './entities/shift.entity';
import { CreateShiftInput, UpdateShiftInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';
import { User } from '../../iam/users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Plant } from 'src/crm/plants/entities/plant.entity';
import { ShiftsLoader } from './shifts.loader';

@Resolver(() => Shift)
export class ShiftsResolver {
  constructor(
    private readonly shiftsService: ShiftsService,
    private readonly shiftsLoader: ShiftsLoader,
  ) {}

  @Mutation(() => Shift, { name: 'createShift' })
  @UseGuards(JwtAuthGuard)
  createShift(
    @Args('createShiftInput') createInput: CreateShiftInput,
    @CurrentUser() user: User,
  ): Promise<Shift> {
    return this.shiftsService.create(createInput, user);
  }

  @Query(() => [Shift], { name: 'shifts' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Shift[]> {
    return this.shiftsService.findAll(paginationArgs);
  }

  @Query(() => Shift, { name: 'shift' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Shift> {
    return this.shiftsService.findOne(id);
  }

  @Mutation(() => Shift, { name: 'updateShift' })
  @UseGuards(JwtAuthGuard)
  updateShift(
    @Args('updateShiftInput') updateInput: UpdateShiftInput,
    @CurrentUser() user: User,
  ): Promise<Shift> {
    return this.shiftsService.update(updateInput.id, updateInput, user);
  }

  @Mutation(() => Shift, { name: 'removeShift' })
  @UseGuards(JwtAuthGuard)
  removeShift(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
    @CurrentUser() user: User,
  ): Promise<Shift> {
    return this.shiftsService.remove(id, isActive, user);
  }

  @ResolveField(() => Plant, { nullable: true })
  async plant(@Parent() shift: Shift): Promise<Plant | null> {
    if (!shift.plantId) return null;
    return this.shiftsLoader.batchPlants.load(shift.plantId);
  }

  @ResolveField(() => Project, { nullable: true })
  async project(@Parent() shift: Shift): Promise<Project | null> {
    if (!shift.projectId) return null;
    return this.shiftsLoader.batchProjects.load(shift.projectId);
  }
}
