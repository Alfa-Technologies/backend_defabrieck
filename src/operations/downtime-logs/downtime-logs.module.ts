import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DowntimeLogsService } from './downtime-logs.service';
import { DowntimeLogsResolver } from './downtime-logs.resolver';
import { DowntimeLog } from './entities/downtime-log.entity';
import { Project } from '../projects/entities/project.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { DowntimeReason } from '../../catalogs/downtime-reasons/entities/downtime-reason.entity';
import { DowntimeLogsLoader } from './downtime-logs.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([DowntimeLog, Project, Employee, DowntimeReason]),
  ],
  providers: [DowntimeLogsResolver, DowntimeLogsService, DowntimeLogsLoader],
  exports: [DowntimeLogsService, DowntimeLogsLoader],
})
export class DowntimeLogsModule {}
