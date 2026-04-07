import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Company } from '../../crm/companies/entities/company.entity';
import { DefectType } from '../defect-types/entities/defect-type.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class PartCatalogLoader {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(DefectType)
    private readonly defectTypeRepository: Repository<DefectType>,
  ) {}

  public readonly batchCompany = new DataLoader<string, Company | null>(
    async (companyIds: readonly string[]) => {
      const companies = await this.companyRepository.find({
        where: { id: In([...companyIds]) },
      });

      const companyMap = new Map(
        companies.map((company) => [company.id, company]),
      );
      return companyIds.map((id) => companyMap.get(id) || null);
    },
  );

  public readonly batchDefectTypes = new DataLoader<string, DefectType[]>(
    async (partIds: readonly string[]) => {
      const defectTypes = await this.defectTypeRepository.find({
        where: { partId: In([...partIds]), isActive: true },
      });

      const defectTypeMap = new Map<string, DefectType[]>();
      partIds.forEach((partId) => defectTypeMap.set(partId, []));

      defectTypes.forEach((defectType) => {
        const current = defectTypeMap.get(defectType.partId) || [];
        current.push(defectType);
        defectTypeMap.set(defectType.partId, current);
      });

      return partIds.map((partId) => defectTypeMap.get(partId) || []);
    },
  );
}
