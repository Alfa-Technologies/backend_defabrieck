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
import { PersonnelAssignmentsService } from './personnel-assignments.service';
import { PersonnelAssignment } from './entities/personnel-assignment.entity';
import { CreatePersonnelAssignmentInput } from './dto/create-personnel-assignment.input';
import { UpdatePersonnelAssignmentInput } from './dto/update-personnel-assignment.input';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { PersonnelAssignmentsLoader } from './personnel-assignments.loader';

@Resolver(() => PersonnelAssignment)
export class PersonnelAssignmentsResolver {
  constructor(
    private readonly personnelAssignmentsService: PersonnelAssignmentsService,
    private readonly personnelAssignmentsLoader: PersonnelAssignmentsLoader,
  ) {}

  @Mutation(() => PersonnelAssignment, { name: 'createPersonnelAssignment' })
  createPersonnelAssignment(
    @Args('createPersonnelAssignmentInput')
    createInput: CreatePersonnelAssignmentInput,
  ): Promise<PersonnelAssignment> {
    return this.personnelAssignmentsService.create(createInput);
  }

  @Query(() => [PersonnelAssignment], { name: 'personnelAssignments' })
  findAll(
    @Args() paginationArgs: PaginationArgs,
  ): Promise<PersonnelAssignment[]> {
    return this.personnelAssignmentsService.findAll(paginationArgs);
  }

  @Query(() => PersonnelAssignment, { name: 'personnelAssignment' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<PersonnelAssignment> {
    return this.personnelAssignmentsService.findOne(id);
  }

  @Mutation(() => PersonnelAssignment, { name: 'updatePersonnelAssignment' })
  updatePersonnelAssignment(
    @Args('updatePersonnelAssignmentInput')
    updateInput: UpdatePersonnelAssignmentInput,
  ): Promise<PersonnelAssignment> {
    return this.personnelAssignmentsService.update(updateInput.id, updateInput);
  }

  @Mutation(() => PersonnelAssignment, { name: 'removePersonnelAssignment' })
  removePersonnelAssignment(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<PersonnelAssignment> {
    return this.personnelAssignmentsService.remove(id, isActive);
  }

  // ResolveFields con DataLoader
  @ResolveField(() => Employee, { nullable: true })
  async employee(
    @Parent() assignment: PersonnelAssignment,
  ): Promise<Employee | null> {
    if (!assignment.employeeId) {
      return null;
    }
    return this.personnelAssignmentsLoader.batchEmployees.load(
      assignment.employeeId,
    );
  }

  @ResolveField(() => Plant, { nullable: true })
  async plant(
    @Parent() assignment: PersonnelAssignment,
  ): Promise<Plant | null> {
    if (!assignment.plantId) {
      return null;
    }
    return this.personnelAssignmentsLoader.batchPlants.load(assignment.plantId);
  }

  @ResolveField(() => Shift, { nullable: true })
  async shift(
    @Parent() assignment: PersonnelAssignment,
  ): Promise<Shift | null> {
    if (!assignment.shiftId) {
      return null;
    }
    return this.personnelAssignmentsLoader.batchShifts.load(assignment.shiftId);
  }
}
