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
import { ProjectPartsService } from './project-parts.service';
import { ProjectPart } from './entities/project-part.entity';
import { CreateProjectPartInput, UpdateProjectPartInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';
import { User } from '../../iam/users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { PartCatalog } from '../../catalogs/part-catalog/entities/part-catalog.entity';
import { ProjectPartsLoader } from './project-parts.loader';

@Resolver(() => ProjectPart)
export class ProjectPartsResolver {
  constructor(
    private readonly projectPartsService: ProjectPartsService,
    private readonly projectPartsLoader: ProjectPartsLoader,
  ) {}

  @Mutation(() => ProjectPart, { name: 'createProjectPart' })
  @UseGuards(JwtAuthGuard)
  createProjectPart(
    @Args('createProjectPartInput') createInput: CreateProjectPartInput,
    @CurrentUser() user: User,
  ): Promise<ProjectPart> {
    return this.projectPartsService.create(createInput, user);
  }

  @Query(() => [ProjectPart], { name: 'projectParts' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<ProjectPart[]> {
    return this.projectPartsService.findAll(paginationArgs);
  }

  @Query(() => ProjectPart, { name: 'projectPart' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<ProjectPart> {
    return this.projectPartsService.findOne(id);
  }

  @Mutation(() => ProjectPart, { name: 'updateProjectPart' })
  @UseGuards(JwtAuthGuard)
  updateProjectPart(
    @Args('updateProjectPartInput') updateInput: UpdateProjectPartInput,
    @CurrentUser() user: User,
  ): Promise<ProjectPart> {
    return this.projectPartsService.update(updateInput.id, updateInput, user);
  }

  @Mutation(() => ProjectPart, { name: 'removeProjectPart' })
  @UseGuards(JwtAuthGuard)
  removeProjectPart(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
    @CurrentUser() user: User,
  ): Promise<ProjectPart> {
    return this.projectPartsService.remove(id, isActive, user);
  }

  // ResolveFields con DataLoader
  @ResolveField(() => Project, { nullable: true })
  async project(@Parent() part: ProjectPart): Promise<Project | null> {
    if (!part.projectId) {
      return null;
    }
    return this.projectPartsLoader.batchProjects.load(part.projectId);
  }

  @ResolveField(() => PartCatalog, { nullable: true })
  async partCatalog(@Parent() part: ProjectPart): Promise<PartCatalog | null> {
    if (!part.partCatalogId) {
      return null;
    }
    return this.projectPartsLoader.batchPartCatalogs.load(part.partCatalogId);
  }
}
