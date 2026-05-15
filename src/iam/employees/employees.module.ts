import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesResolver } from './employees.resolver';
import { Employee } from './entities/employee.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { User } from '../users/entities/user.entity';
import { EmployeesLoader } from './employees.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Beneficiary, User])],
  providers: [EmployeesResolver, EmployeesService, EmployeesLoader],
  exports: [TypeOrmModule, EmployeesService, EmployeesLoader],
})
export class EmployeesModule {}
