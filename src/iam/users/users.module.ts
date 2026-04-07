import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { UsersLoader } from './users.loader';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, CompanyContact])],
  providers: [UsersResolver, UsersService, UsersLoader],
  exports: [UsersService, TypeOrmModule, UsersLoader],
})
export class UsersModule {}
