import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesResolver } from './employees.resolver';
import { Employee } from './entities/employee.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { User } from '../users/entities/user.entity';
import { EmployeesLoader } from './employees.loader';
import { Department } from '../../catalogs/departments/entities/department.entity';
import { Position } from '../../catalogs/positions/entities/position.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Beneficiary,
      User,
      Department,
      Position,
    ]),
  ],
  providers: [EmployeesResolver, EmployeesService, EmployeesLoader],
  exports: [TypeOrmModule, EmployeesService, EmployeesLoader],
})
export class EmployeesModule {}
