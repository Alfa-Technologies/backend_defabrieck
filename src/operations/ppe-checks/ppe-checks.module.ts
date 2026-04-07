import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PpeChecksService } from './ppe-checks.service';
import { PpeChecksResolver } from './ppe-checks.resolver';
import { PpeCheck } from './entities/ppe-check.entity';
import { Project } from '../projects/entities/project.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { User } from '../../iam/users/entities/user.entity';
import { PpeChecksLoader } from './ppe-checks.loader';

@Module({
  imports: [TypeOrmModule.forFeature([PpeCheck, Project, Employee, User])],
  providers: [PpeChecksResolver, PpeChecksService, PpeChecksLoader],
  exports: [PpeChecksService, PpeChecksLoader],
})
export class PpeChecksModule {}
