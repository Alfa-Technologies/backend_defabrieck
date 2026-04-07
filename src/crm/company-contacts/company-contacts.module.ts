import { Module } from '@nestjs/common';
import { CompanyContactsService } from './company-contacts.service';
import { CompanyContactsResolver } from './company-contacts.resolver';
import { UsersModule } from '../../iam/users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyContact } from './entities/company-contact.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../../iam/users/entities/user.entity';
import { CompanyContactsLoader } from './company-contacts.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyContact, Company, User]),
    UsersModule,
    CompaniesModule,
  ],
  providers: [
    CompanyContactsResolver,
    CompanyContactsService,
    CompanyContactsLoader,
  ],
  exports: [TypeOrmModule, CompanyContactsService, CompanyContactsLoader],
})
export class CompanyContactsModule {}
