import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { ReportTypesService } from './report-types.service';
import { ReportType } from './entities/report-type.entity';
import { CreateReportTypeInput, UpdateReportTypeInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Resolver(() => ReportType)
export class ReportTypesResolver {
  constructor(private readonly reportTypesService: ReportTypesService) {}

  @Mutation(() => ReportType, { name: 'createReportType' })
  createReportType(
    @Args('createReportTypeInput') createInput: CreateReportTypeInput,
  ): Promise<ReportType> {
    return this.reportTypesService.create(createInput);
  }

  @Query(() => [ReportType], { name: 'reportTypes' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<ReportType[]> {
    return this.reportTypesService.findAll(paginationArgs);
  }

  @Query(() => ReportType, { name: 'reportType' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<ReportType> {
    return this.reportTypesService.findOne(id);
  }

  @Mutation(() => ReportType, { name: 'updateReportType' })
  updateReportType(
    @Args('updateReportTypeInput') updateInput: UpdateReportTypeInput,
  ): Promise<ReportType> {
    return this.reportTypesService.update(updateInput.id, updateInput);
  }

  @Mutation(() => ReportType, { name: 'removeReportType' })
  removeReportType(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<ReportType> {
    return this.reportTypesService.remove(id, isActive);
  }
}
