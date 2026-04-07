import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { User } from '../../iam/users/entities/user.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class CompanyContactsLoader {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public readonly batchCompany = new DataLoader<string, Company | null>(
    async (companyIds: readonly string[]) => {
      const companies = await this.companyRepository.find({
        where: { id: In([...companyIds]) },
      });

      const companyMap = new Map(companies.map((company) => [company.id, company]));
      return companyIds.map((id) => companyMap.get(id) || null);
    },
  );

  public readonly batchUser = new DataLoader<string, User | null>(
    async (userIds: readonly string[]) => {
      const users = await this.userRepository.find({
        where: { id: In([...userIds]) },
      });

      const userMap = new Map(users.map((user) => [user.id, user]));
      return userIds.map((id) => userMap.get(id) || null);
    },
  );
}
