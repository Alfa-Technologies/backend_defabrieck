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

import { SettlementsService } from './settlements.service';
import { Settlement } from './entities/settlement.entity';
import { CreateSettlementInput, UpdateSettlementInput } from './dto';
import { SettlementsLoader } from './settlements.loader';
import { Employee } from '../../iam/employees/entities/employee.entity';

@Resolver(() => Settlement)
export class SettlementsResolver {
  constructor(
    private readonly settlementsService: SettlementsService,
    private readonly settlementsLoader: SettlementsLoader,
  ) {}

  @Mutation(() => Settlement, { name: 'createSettlement' })
  @UseGuards(JwtAuthGuard)
  createSettlement(
    @Args('createSettlementInput') createSettlementInput: CreateSettlementInput,
  ): Promise<Settlement> {
    return this.settlementsService.create(createSettlementInput);
  }

  @Query(() => [Settlement], { name: 'settlements' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Settlement[]> {
    return this.settlementsService.findAll(paginationArgs);
  }

  @Query(() => Settlement, { name: 'settlement' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Settlement> {
    return this.settlementsService.findOne(id);
  }

  @Mutation(() => Settlement, { name: 'updateSettlement' })
  @UseGuards(JwtAuthGuard)
  updateSettlement(
    @Args('updateSettlementInput') updateSettlementInput: UpdateSettlementInput,
  ): Promise<Settlement> {
    return this.settlementsService.update(updateSettlementInput);
  }

  @Mutation(() => Settlement, { name: 'changeSettlementStatus' })
  @UseGuards(JwtAuthGuard)
  changeSettlementStatus(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<Settlement> {
    return this.settlementsService.changeStatus(id, isActive);
  }

  @ResolveField(() => Employee, { nullable: true })
  async employee(@Parent() settlement: Settlement): Promise<Employee | null> {
    if (!settlement.employeeId) return null;
    return this.settlementsLoader.batchEmployees.load(settlement.employeeId);
  }
}
