import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportTypesService } from './report-types.service';
import { ReportTypesResolver } from './report-types.resolver';
import { ReportType } from './entities/report-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportType])],
  providers: [ReportTypesResolver, ReportTypesService],
  exports: [TypeOrmModule],
})
export class ReportTypesModule {}
