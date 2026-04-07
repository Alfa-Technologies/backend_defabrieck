import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DowntimeReasonsService } from './downtime-reasons.service';
import { DowntimeReasonsResolver } from './downtime-reasons.resolver';
import { DowntimeReason } from './entities/downtime-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DowntimeReason])],
  providers: [DowntimeReasonsResolver, DowntimeReasonsService],
  exports: [DowntimeReasonsService],
})
export class DowntimeReasonsModule {}
