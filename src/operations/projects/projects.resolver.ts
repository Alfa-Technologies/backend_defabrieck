import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { CreateProjectInput, UpdateProjectInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { JwtAuthGuard } from 'src/iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/iam/auth/decorators/current-user.decorator';
import { User } from 'src/iam/users/entities/user.entity';
import { ProjectProcessFlow } from './entities/project-process-flow.entity';
import { CreateProcessFlowInput } from './dto/create-process-flow.input';
import { ProjectStatusGuard } from '../../common/guards/project-status.guard';
import { Company } from '../../crm/companies/entities/company.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { ReportType } from '../../catalogs/report-types/entities/report-type.entity';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { ProjectLog } from './entities/project-log.entity';
import { ProjectPart } from '../project-parts/entities/project-part.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { ProjectsLoader } from './projects.loader';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectsLoader: ProjectsLoader,
  ) {}

  @Mutation(() => Project, { name: 'createProject' })
  @UseGuards(JwtAuthGuard)
  createProject(
    @Args('createProjectInput') createInput: CreateProjectInput,
    @CurrentUser() user: User,
  ): Promise<Project> {
    return this.projectsService.create(createInput, user);
  }

  @Query(() => [Project], { name: 'projects' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Project[]> {
    return this.projectsService.findAll(paginationArgs);
  }

  @Query(() => Project, { name: 'project' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Project> {
    return this.projectsService.findOne(id);
  }

  @Mutation(() => Project, { name: 'updateProject' })
  @UseGuards(JwtAuthGuard, ProjectStatusGuard)
  updateProject(
    @Args('updateProjectInput') updateInput: UpdateProjectInput,
    @CurrentUser() user: User,
  ): Promise<Project> {
    return this.projectsService.update(updateInput.id, updateInput, user);
  }

  @Mutation(() => Project, { name: 'removeProject' })
  @UseGuards(JwtAuthGuard)
  removeProject(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
    @CurrentUser() user: User,
  ): Promise<Project> {
    return this.projectsService.remove(id, isActive, user);
  }

  @Mutation(() => ProjectProcessFlow)
  @UseGuards(JwtAuthGuard)
  addProcessFlowToProject(
    @Args('createProcessFlowInput')
    createProcessFlowInput: CreateProcessFlowInput,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.addProcessFlow(createProcessFlowInput, user);
  }

  @Mutation(() => Project)
  @UseGuards(JwtAuthGuard)
  signProjectAsCustomer(
    @Args('projectId') projectId: string,
    @Args('signatureUrl') signatureUrl: string,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.signProjectAsCustomer(
      projectId,
      signatureUrl,
      user,
    );
  }

  @Mutation(() => Project)
  @UseGuards(JwtAuthGuard)
  signProjectAsFinalCustomer(
    @Args('projectId') projectId: string,
    @Args('signatureUrl') signatureUrl: string,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.signProjectAsFinalCustomer(
      projectId,
      signatureUrl,
      user,
    );
  }

  @Mutation(() => Project)
  @UseGuards(JwtAuthGuard)
  signProjectAsInternal(
    @Args('projectId') projectId: string,
    @Args('signatureUrl') signatureUrl: string,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.signProjectAsInternal(
      projectId,
      signatureUrl,
      user,
    );
  }

  // ResolveFields con DataLoader
  @ResolveField(() => Company, { nullable: true })
  async customer(@Parent() project: Project): Promise<Company | null> {
    if (!project.customerId) {
      return null;
    }
    return this.projectsLoader.batchCompanies.load(project.customerId);
  }

  @ResolveField(() => Company, { nullable: true })
  async finalCustomer(@Parent() project: Project): Promise<Company | null> {
    if (!project.finalCustomerId) {
      return null;
    }
    return this.projectsLoader.batchCompanies.load(project.finalCustomerId);
  }

  @ResolveField(() => Plant, { nullable: true })
  async plant(@Parent() project: Project): Promise<Plant | null> {
    if (!project.plantId) {
      return null;
    }
    return this.projectsLoader.batchPlants.load(project.plantId);
  }

  @ResolveField(() => ReportType, { nullable: true })
  async reportType(@Parent() project: Project): Promise<ReportType | null> {
    if (!project.reportTypeId) {
      return null;
    }
    return this.projectsLoader.batchReportTypes.load(project.reportTypeId);
  }

  @ResolveField(() => CompanyContact, { nullable: true })
  async customerContact(
    @Parent() project: Project,
  ): Promise<CompanyContact | null> {
    if (!project.customerContactId) {
      return null;
    }
    return this.projectsLoader.batchCompanyContacts.load(
      project.customerContactId,
    );
  }

  @ResolveField(() => CompanyContact, { nullable: true })
  async finalCustomerContact(
    @Parent() project: Project,
  ): Promise<CompanyContact | null> {
    if (!project.finalCustomerContactId) {
      return null;
    }
    return this.projectsLoader.batchCompanyContacts.load(
      project.finalCustomerContactId,
    );
  }

  @ResolveField(() => Employee, { nullable: true })
  async internalLead(@Parent() project: Project): Promise<Employee | null> {
    if (!project.internalLeadId) {
      return null;
    }
    return this.projectsLoader.batchEmployees.load(project.internalLeadId);
  }

  @ResolveField(() => [ProjectLog], { nullable: true })
  async logs(@Parent() project: Project): Promise<ProjectLog[]> {
    return this.projectsLoader.batchProjectLogs.load(project.id);
  }

  @ResolveField(() => [ProjectPart], { nullable: true })
  async parts(@Parent() project: Project): Promise<ProjectPart[]> {
    return this.projectsLoader.batchProjectParts.load(project.id);
  }

  @ResolveField(() => [Shift], { nullable: true })
  async shifts(@Parent() project: Project): Promise<Shift[]> {
    return this.projectsLoader.batchShifts.load(project.id);
  }

  @ResolveField(() => [ProjectProcessFlow], { nullable: true })
  async processFlows(
    @Parent() project: Project,
  ): Promise<ProjectProcessFlow[]> {
    return this.projectsLoader.batchProjectProcessFlows.load(project.id);
  }
}
