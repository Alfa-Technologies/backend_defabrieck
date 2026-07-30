import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Float,
} from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { CreateEmployeeInput, UpdateEmployeeInput } from './dto';
import { GetEmployeesArgs } from './args/get-employees.args';
import { User } from '../users/entities/user.entity';
import { EmployeesLoader } from './employees.loader';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

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
  @UseGuards(JwtAuthGuard)
  findAll(
    @Args() args: GetEmployeesArgs,
    @CurrentUser([
      ValidRoles.superUser,
      ValidRoles.admin,
      ValidRoles.coordinator,
      ValidRoles.rh,
    ])
    _user: User,
  ): Promise<Employee[]> {
    return this.employeesService.findAll(args);
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

  @Mutation(() => Employee, { name: 'updateEmployeeSalary' })
  updateEmployeeSalary(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('dailySalary', { type: () => Float }) dailySalary: number,
  ): Promise<Employee> {
    return this.employeesService.updateEmployeeSalary(id, dailySalary);
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

  @ResolveField(() => [Beneficiary], { nullable: 'itemsAndList' })
  async beneficiaries(@Parent() employee: Employee): Promise<Beneficiary[]> {
    return this.employeesService.findBeneficiariesByEmployeeId(employee.id);
  }
}
