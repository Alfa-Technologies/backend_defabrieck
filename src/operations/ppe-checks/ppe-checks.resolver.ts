import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { PpeChecksService } from './ppe-checks.service';
import { PpeCheck } from './entities/ppe-check.entity';
import { CreatePpeCheckInput } from './dto/create-ppe-check.input';
import { User } from '../../iam/users/entities/user.entity';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Project } from '../projects/entities/project.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { PpeChecksLoader } from './ppe-checks.loader';

@Resolver(() => PpeCheck)
@UseGuards(JwtAuthGuard)
export class PpeChecksResolver {
  constructor(
    private readonly ppeChecksService: PpeChecksService,
    private readonly ppeChecksLoader: PpeChecksLoader,
  ) {}

  @Mutation(() => PpeCheck)
  createPpeCheck(
    @Args('createPpeCheckInput') createInput: CreatePpeCheckInput,
    @CurrentUser() user: User,
  ): Promise<PpeCheck> {
    return this.ppeChecksService.create(createInput, user);
  }

  @Query(() => [PpeCheck], { name: 'ppeChecks' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<PpeCheck[]> {
    return this.ppeChecksService.findAll(paginationArgs);
  }

  @Query(() => PpeCheck, { name: 'ppeCheck' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<PpeCheck> {
    return this.ppeChecksService.findOne(id);
  }

  @Query(() => [PpeCheck], { name: 'ppeChecksByProject' })
  findByProject(
    @Args('projectId', { type: () => ID }, ParseUUIDPipe) projectId: string,
  ): Promise<PpeCheck[]> {
    return this.ppeChecksService.findByProject(projectId);
  }

  @Mutation(() => PpeCheck)
  removePpeCheck(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<PpeCheck> {
    return this.ppeChecksService.remove(id);
  }

  // ResolveFields con DataLoader
  @ResolveField(() => Project, { nullable: true })
  async project(@Parent() check: PpeCheck): Promise<Project | null> {
    if (!check.projectId) {
      return null;
    }
    return this.ppeChecksLoader.batchProjects.load(check.projectId);
  }

  @ResolveField(() => User, { nullable: true })
  async auditor(@Parent() check: PpeCheck): Promise<User | null> {
    if (!check.auditorId) {
      return null;
    }
    return this.ppeChecksLoader.batchUsers.load(check.auditorId);
  }

  @ResolveField(() => Employee, { nullable: true })
  async targetEmployee(@Parent() check: PpeCheck): Promise<Employee | null> {
    if (!check.targetEmployeeId) {
      return null;
    }
    return this.ppeChecksLoader.batchEmployees.load(check.targetEmployeeId);
  }
}
