import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityAuditsService } from './quality-audits.service';
import { QualityAuditsResolver } from './quality-audits.resolver';
import { QualityAudit } from './entities/quality-audit.entity';
import { Project } from '../projects/entities/project.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { User } from '../../iam/users/entities/user.entity';
import { QualityAuditsLoader } from './quality-audits.loader';

@Module({
  imports: [TypeOrmModule.forFeature([QualityAudit, Project, Employee, User])],
  providers: [QualityAuditsResolver, QualityAuditsService, QualityAuditsLoader],
  exports: [QualityAuditsService, QualityAuditsLoader],
})
export class QualityAuditsModule {}
