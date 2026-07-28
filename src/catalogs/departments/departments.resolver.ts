import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
} from '@nestjs/graphql';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { CreateDepartmentInput, UpdateDepartmentInput } from './dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Resolver(() => Department)
export class DepartmentsResolver {
  constructor(
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Mutation(() => Department, { name: 'createDepartment' })
  createDepartment(
    @Args('createDepartmentInput') createDepartmentInput: CreateDepartmentInput,
  ): Promise<Department> {
    return this.departmentsService.create(createDepartmentInput);
  }

  @Query(() => [Department], { name: 'departments' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Department[]> {
    return this.departmentsService.findAll(paginationArgs);
  }

  @Query(() => Department, { name: 'department' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  @Mutation(() => Department, { name: 'updateDepartment' })
  updateDepartment(
    @Args('updateDepartmentInput') updateDepartmentInput: UpdateDepartmentInput,
  ): Promise<Department> {
    return this.departmentsService.update(
      updateDepartmentInput.id,
      updateDepartmentInput,
    );
  }

  @Mutation(() => Department, { name: 'removeDepartment' })
  removeDepartment(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<Department> {
    return this.departmentsService.remove(id, isActive);
  }
}
