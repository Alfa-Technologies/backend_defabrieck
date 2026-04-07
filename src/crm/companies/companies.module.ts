import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesResolver } from './companies.resolver';
import { Company } from './entities/company.entity';
import { Plant } from '../plants/entities/plant.entity';
import { CompanyContact } from '../company-contacts/entities/company-contact.entity';
import { PartCatalog } from '../../catalogs/part-catalog/entities/part-catalog.entity';
import { CompaniesLoader } from './companies.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Plant, CompanyContact, PartCatalog]),
  ],
  providers: [CompaniesResolver, CompaniesService, CompaniesLoader],
  exports: [TypeOrmModule, CompaniesService, CompaniesLoader],
})
export class CompaniesModule {}
