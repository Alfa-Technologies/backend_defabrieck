import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContractsService } from './contracts.service';
import { ContractsResolver } from './contracts.resolver';
import { Contract } from './entities/contract.entity';
import { ContractsLoader } from './contracts.loader';
import { Employee } from '../../iam/employees/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Employee])],
  providers: [ContractsResolver, ContractsService, ContractsLoader],
  exports: [ContractsService, ContractsLoader],
})
export class ContractsModule {}
