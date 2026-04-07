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
import { QualityAuditsService } from './quality-audits.service';
import { QualityAudit } from './entities/quality-audit.entity';
import { CreateQualityAuditInput } from './dto/create-quality-audit.input';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';
import { User } from '../../iam/users/entities/user.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Project } from '../projects/entities/project.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { QualityAuditsLoader } from './quality-audits.loader';

@Resolver(() => QualityAudit)
@UseGuards(JwtAuthGuard)
export class QualityAuditsResolver {
  constructor(
    private readonly qualityAuditsService: QualityAuditsService,
    private readonly qualityAuditsLoader: QualityAuditsLoader,
  ) {}

  @Mutation(() => QualityAudit)
  createQualityAudit(
    @Args('createQualityAuditInput') createInput: CreateQualityAuditInput,
    @CurrentUser() user: User,
  ): Promise<QualityAudit> {
    return this.qualityAuditsService.create(createInput, user);
  }

  @Query(() => [QualityAudit], { name: 'qualityAudits' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<QualityAudit[]> {
    return this.qualityAuditsService.findAll(paginationArgs);
  }

  @Query(() => QualityAudit, { name: 'qualityAudit' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<QualityAudit> {
    return this.qualityAuditsService.findOne(id);
  }

  @Query(() => [QualityAudit], { name: 'qualityAuditsByProject' })
  findByProject(
    @Args('projectId', { type: () => ID }, ParseUUIDPipe) projectId: string,
  ): Promise<QualityAudit[]> {
    return this.qualityAuditsService.findByProject(projectId);
  }

  // ResolveFields con DataLoader
  @ResolveField(() => Project, { nullable: true })
  async project(@Parent() audit: QualityAudit): Promise<Project | null> {
    if (!audit.projectId) {
      return null;
    }
    return this.qualityAuditsLoader.batchProjects.load(audit.projectId);
  }

  @ResolveField(() => User, { nullable: true })
  async auditor(@Parent() audit: QualityAudit): Promise<User | null> {
    if (!audit.auditorId) {
      return null;
    }
    return this.qualityAuditsLoader.batchUsers.load(audit.auditorId);
  }

  @ResolveField(() => Employee, { nullable: true })
  async targetEmployee(
    @Parent() audit: QualityAudit,
  ): Promise<Employee | null> {
    if (!audit.targetEmployeeId) {
      return null;
    }
    return this.qualityAuditsLoader.batchEmployees.load(audit.targetEmployeeId);
  }
}
