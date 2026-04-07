import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceLog } from './entities/attendance-log.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { User } from '../../iam/users/entities/user.entity';
import { AttendanceLoader } from './attendance.loader';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceLog, Employee, Plant, User])],
  providers: [AttendanceResolver, AttendanceService, AttendanceLoader],
  exports: [AttendanceService, AttendanceLoader],
})
export class AttendanceModule {}
