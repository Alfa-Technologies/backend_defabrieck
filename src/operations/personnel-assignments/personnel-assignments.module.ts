import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonnelAssignmentsService } from './personnel-assignments.service';
import { PersonnelAssignmentsResolver } from './personnel-assignments.resolver';
import { PersonnelAssignment } from './entities/personnel-assignment.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { PersonnelAssignmentsLoader } from './personnel-assignments.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonnelAssignment, Employee, Plant, Shift]),
  ],
  providers: [
    PersonnelAssignmentsResolver,
    PersonnelAssignmentsService,
    PersonnelAssignmentsLoader,
  ],
  exports: [PersonnelAssignmentsService, PersonnelAssignmentsLoader],
})
export class PersonnelAssignmentsModule {}
