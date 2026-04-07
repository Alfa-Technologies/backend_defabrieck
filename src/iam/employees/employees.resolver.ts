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
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeInput, UpdateEmployeeInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { User } from '../users/entities/user.entity';
import { EmployeesLoader } from './employees.loader';

@Resolver(() => Employee)
export class EmployeesResolver {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly employeesLoader: EmployeesLoader,
  ) {}

  @Mutation(() => Employee, { name: 'createEmployee' })
  createEmployee(
    @Args('createEmployeeInput') createInput: CreateEmployeeInput,
  ): Promise<Employee> {
    return this.employeesService.create(createInput);
  }

  @Query(() => [Employee], { name: 'employees' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Employee[]> {
    return this.employeesService.findAll(paginationArgs);
  }

  @Query(() => Employee, { name: 'employee' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Mutation(() => Employee, { name: 'updateEmployee' })
  updateEmployee(
    @Args('updateEmployeeInput') updateInput: UpdateEmployeeInput,
  ): Promise<Employee> {
    return this.employeesService.update(updateInput.id, updateInput);
  }

  @Mutation(() => Employee, { name: 'removeEmployee' })
  removeEmployee(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<Employee> {
    return this.employeesService.remove(id, isActive);
  }

  @ResolveField(() => String, { name: 'displayName' })
  displayName(@Parent() employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`.trim();
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() employee: Employee): Promise<User | null> {
    if (!employee.userId) {
      return null;
    }
    return this.employeesLoader.batchUsers.load(employee.userId);
  }
}
