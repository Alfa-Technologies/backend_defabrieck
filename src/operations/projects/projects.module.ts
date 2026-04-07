import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { Project } from './entities/project.entity';
import { Company } from '../../crm/companies/entities/company.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { ReportType } from '../../catalogs/report-types/entities/report-type.entity';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { ProjectLog } from './entities/project-log.entity';
import { ProjectPart } from '../project-parts/entities/project-part.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { ProjectProcessFlow } from './entities/project-process-flow.entity';
import { ProjectsLoader } from './projects.loader';
import { ProjectAuditSubscriber } from './subscribers/project-audit.subscriber';
import { VisualAidDocument } from '../../catalogs/visual-aid-documents/entities/visual-aid-document.entity';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectProcessFlow,
      ProjectLog,
      VisualAidDocument,
      Company,
      Plant,
      ReportType,
      CompanyContact,
      Employee,
      ProjectPart,
      Shift,
    ]),
    ShiftsModule,
  ],
  providers: [
    ProjectsResolver,
    ProjectsService,
    ProjectsLoader,
    ProjectAuditSubscriber,
  ],
  exports: [TypeOrmModule, ProjectsService, ProjectsLoader],
})
export class ProjectsModule {}
