import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectReportConfigService } from './project-report-config.service';
import { ProjectReportConfigResolver } from './project-report-config.resolver';
import { ProjectReportConfig } from './entities/project-report-config.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectReportConfigLoader } from './project-report-config.loader';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectReportConfig, Project])],
  providers: [
    ProjectReportConfigResolver,
    ProjectReportConfigService,
    ProjectReportConfigLoader,
  ],
  exports: [
    TypeOrmModule,
    ProjectReportConfigService,
    ProjectReportConfigLoader,
  ],
})
export class ProjectReportConfigModule {}
