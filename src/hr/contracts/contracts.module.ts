import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContractsService } from './contracts.service';
import { ContractsResolver } from './contracts.resolver';
import { Contract } from './entities/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract])],
  providers: [ContractsResolver, ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
