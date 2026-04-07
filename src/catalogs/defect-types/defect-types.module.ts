import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefectTypesService } from './defect-types.service';
import { DefectTypesResolver } from './defect-types.resolver';
import { DefectType } from './entities/defect-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DefectType])],
  providers: [DefectTypesResolver, DefectTypesService],
  exports: [DefectTypesService],
})
export class DefectTypesModule {}
