import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';

import { ContractsService } from './contracts.service';
import { Contract } from './entities/contract.entity';
import { CreateContractInput, UpdateContractInput } from './dto';
import { ContractsLoader } from './contracts.loader';
import { Employee } from '../../iam/employees/entities/employee.entity';

@Resolver(() => Contract)
export class ContractsResolver {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly contractsLoader: ContractsLoader,
  ) {}

  @Mutation(() => Contract, { name: 'createContract' })
  @UseGuards(JwtAuthGuard)
  createContract(
    @Args('createContractInput') createContractInput: CreateContractInput,
  ): Promise<Contract> {
    return this.contractsService.create(createContractInput);
  }

  @Query(() => [Contract], { name: 'contracts' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Contract[]> {
    return this.contractsService.findAll(paginationArgs);
  }

  @Query(() => Contract, { name: 'contract' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Contract> {
    return this.contractsService.findOne(id);
  }

  @Mutation(() => Contract, { name: 'updateContract' })
  @UseGuards(JwtAuthGuard)
  updateContract(
    @Args('updateContractInput') updateContractInput: UpdateContractInput,
  ): Promise<Contract> {
    return this.contractsService.update(updateContractInput);
  }

  @Mutation(() => Contract, { name: 'changeContractStatus' })
  @UseGuards(JwtAuthGuard)
  changeContractStatus(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<Contract> {
    return this.contractsService.changeStatus(id, isActive);
  }

  @ResolveField(() => Employee, { nullable: true })
  async employee(@Parent() contract: Contract): Promise<Employee | null> {
    if (!contract.employeeId) return null;
    return this.contractsLoader.batchEmployees.load(contract.employeeId);
  }
}
