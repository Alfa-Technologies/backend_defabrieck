import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartCatalogService } from './part-catalog.service';
import { PartCatalogResolver } from './part-catalog.resolver';
import { PartCatalog } from './entities/part-catalog.entity';
import { Company } from '../../crm/companies/entities/company.entity';
import { PartCatalogLoader } from './part-catalog.loader';
import { DefectType } from '../defect-types/entities/defect-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartCatalog, Company, DefectType])],
  providers: [PartCatalogResolver, PartCatalogService, PartCatalogLoader],
  exports: [TypeOrmModule, PartCatalogService, PartCatalogLoader],
})
export class PartCatalogModule {}
