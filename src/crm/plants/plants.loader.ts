import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class PlantsLoader {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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
}
