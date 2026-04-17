import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettlementsService } from './settlements.service';
import { SettlementsResolver } from './settlements.resolver';
import { Settlement } from './entities/settlement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settlement])],
  providers: [SettlementsResolver, SettlementsService],
  exports: [SettlementsService],
})
export class SettlementsModule {}
