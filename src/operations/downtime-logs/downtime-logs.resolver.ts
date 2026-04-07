import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { DowntimeLogsService } from './downtime-logs.service';
import { DowntimeLog } from './entities/downtime-log.entity';
import { CreateDowntimeLogInput } from './dto/create-downtime-log.input';
import { UpdateDowntimeLogInput } from './dto/update-downtime-log.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Project } from '../projects/entities/project.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { DowntimeReason } from '../../catalogs/downtime-reasons/entities/downtime-reason.entity';
import { DowntimeLogsLoader } from './downtime-logs.loader';

@Resolver(() => DowntimeLog)
export class DowntimeLogsResolver {
  constructor(
    private readonly downtimeLogsService: DowntimeLogsService,
    private readonly downtimeLogsLoader: DowntimeLogsLoader,
  ) {}

  @Mutation(() => DowntimeLog)
  createDowntimeLog(
    @Args('createDowntimeLogInput')
    createDowntimeLogInput: CreateDowntimeLogInput,
  ): Promise<DowntimeLog> {
    return this.downtimeLogsService.create(createDowntimeLogInput);
  }

  @Query(() => [DowntimeLog], { name: 'downtimeLogs' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<DowntimeLog[]> {
    return this.downtimeLogsService.findAll(paginationArgs);
  }

  @Query(() => DowntimeLog, { name: 'downtimeLog' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<DowntimeLog> {
    return this.downtimeLogsService.findOne(id);
  }

  @Query(() => [DowntimeLog], { name: 'downtimeLogsByProject' })
  findByProject(
    @Args('projectId') projectId: string,
    @Args() paginationArgs: PaginationArgs,
  ): Promise<DowntimeLog[]> {
    return this.downtimeLogsService.findByProject(projectId, paginationArgs);
  }

  @Mutation(() => DowntimeLog)
  updateDowntimeLog(
    @Args('updateDowntimeLogInput')
    updateDowntimeLogInput: UpdateDowntimeLogInput,
  ): Promise<DowntimeLog> {
    return this.downtimeLogsService.update(
      updateDowntimeLogInput.id,
      updateDowntimeLogInput,
    );
  }

  @Mutation(() => DowntimeLog)
  removeDowntimeLog(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<DowntimeLog> {
    return this.downtimeLogsService.remove(id);
  }

  // ResolveFields con DataLoader
  @ResolveField(() => Project, { nullable: true })
  async project(@Parent() log: DowntimeLog): Promise<Project | null> {
    if (!log.projectId) {
      return null;
    }
    return this.downtimeLogsLoader.batchProjects.load(log.projectId);
  }

  @ResolveField(() => Employee, { nullable: true })
  async employee(@Parent() log: DowntimeLog): Promise<Employee | null> {
    if (!log.employeeId) {
      return null;
    }
    return this.downtimeLogsLoader.batchEmployees.load(log.employeeId);
  }

  @ResolveField(() => DowntimeReason, { nullable: true })
  async downtimeReason(
    @Parent() log: DowntimeLog,
  ): Promise<DowntimeReason | null> {
    if (!log.downtimeReasonId) {
      return null;
    }
    return this.downtimeLogsLoader.batchDowntimeReasons.load(
      log.downtimeReasonId,
    );
  }
}
