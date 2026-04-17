import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';

import { ContractsService } from './contracts.service';
import { Contract } from './entities/contract.entity';
import { CreateContractInput, UpdateContractInput } from './dto';

@Resolver(() => Contract)
export class ContractsResolver {
  constructor(private readonly contractsService: ContractsService) {}

  @Mutation(() => Contract, { name: 'createContract' })
  createContract(
    @Args('createContractInput') createContractInput: CreateContractInput,
  ): Promise<Contract> {
    return this.contractsService.create(createContractInput);
  }

  @Query(() => [Contract], { name: 'contracts' })
  findAll(): Promise<Contract[]> {
    return this.contractsService.findAll();
  }

  @Query(() => Contract, { name: 'contract' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Contract> {
    return this.contractsService.findOne(id);
  }

  @Mutation(() => Contract, { name: 'updateContract' })
  updateContract(
    @Args('updateContractInput') updateContractInput: UpdateContractInput,
  ): Promise<Contract> {
    return this.contractsService.update(updateContractInput);
  }

  @Mutation(() => Boolean, { name: 'removeContract' })
  removeContract(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    return this.contractsService.remove(id);
  }
}
