import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettlementsService } from './settlements.service';
import { SettlementsResolver } from './settlements.resolver';
import { Settlement } from './entities/settlement.entity';
import { SettlementsLoader } from './settlements.loader';
import { Employee } from '../../iam/employees/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settlement, Employee])],
  providers: [SettlementsResolver, SettlementsService, SettlementsLoader],
  exports: [SettlementsService, SettlementsLoader],
})
export class SettlementsModule {}
