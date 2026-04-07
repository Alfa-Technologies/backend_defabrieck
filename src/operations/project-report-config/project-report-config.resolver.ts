import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { ProjectReportConfigService } from './project-report-config.service';
import { ProjectReportConfig } from './entities/project-report-config.entity';
import {
  CreateProjectReportConfigInput,
  UpdateProjectReportConfigInput,
} from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';
import { User } from '../../iam/users/entities/user.entity';

@Resolver(() => ProjectReportConfig)
export class ProjectReportConfigResolver {
  constructor(private readonly configService: ProjectReportConfigService) {}

  @Mutation(() => ProjectReportConfig, { name: 'createProjectReportConfig' })
  @UseGuards(JwtAuthGuard)
  createProjectReportConfig(
    @Args('createProjectReportConfigInput')
    createInput: CreateProjectReportConfigInput,
    @CurrentUser() user: User,
  ): Promise<ProjectReportConfig> {
    return this.configService.create(createInput, user);
  }

  @Query(() => [ProjectReportConfig], { name: 'projectReportConfigs' })
  findAll(
    @Args() paginationArgs: PaginationArgs,
  ): Promise<ProjectReportConfig[]> {
    return this.configService.findAll(paginationArgs);
  }

  @Query(() => ProjectReportConfig, { name: 'projectReportConfig' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<ProjectReportConfig> {
    return this.configService.findOne(id);
  }

  @Query(() => ProjectReportConfig, {
    name: 'projectReportConfigByProject',
    nullable: true,
  })
  findByProject(
    @Args('projectId', { type: () => ID }, ParseUUIDPipe) projectId: string,
  ): Promise<ProjectReportConfig | null> {
    return this.configService.findByProjectId(projectId);
  }

  @Mutation(() => ProjectReportConfig, { name: 'updateProjectReportConfig' })
  @UseGuards(JwtAuthGuard)
  updateProjectReportConfig(
    @Args('updateProjectReportConfigInput')
    updateInput: UpdateProjectReportConfigInput,
    @CurrentUser() user: User,
  ): Promise<ProjectReportConfig> {
    return this.configService.update(updateInput.id, updateInput, user);
  }

  @Mutation(() => ProjectReportConfig, { name: 'removeProjectReportConfig' })
  @UseGuards(JwtAuthGuard)
  remove(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
    @CurrentUser() user: User,
  ): Promise<ProjectReportConfig> {
    return this.configService.remove(id, isActive, user);
  }

  @ResolveField(() => String)
  firebasePath(@Parent() config: ProjectReportConfig): string {
    return `projects/${config.projectId}`;
  }
}
