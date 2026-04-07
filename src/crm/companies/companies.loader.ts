import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Plant } from '../plants/entities/plant.entity';
import { CompanyContact } from '../company-contacts/entities/company-contact.entity';
import { PartCatalog } from '../../catalogs/part-catalog/entities/part-catalog.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class CompaniesLoader {
  constructor(
    @InjectRepository(Plant)
    private readonly plantRepository: Repository<Plant>,
    @InjectRepository(CompanyContact)
    private readonly contactRepository: Repository<CompanyContact>,
    @InjectRepository(PartCatalog)
    private readonly partCatalogRepository: Repository<PartCatalog>,
  ) {}

  public readonly batchPlants = new DataLoader<string, Plant[]>(
    async (companyIds: readonly string[]) => {
      const plants = await this.plantRepository.find({
        where: { companyId: In([...companyIds]) },
      });

      const map = new Map<string, Plant[]>();
      companyIds.forEach((id) => map.set(id, [])); // Inicializar vacíos
      plants.forEach((plant) => map.get(plant.companyId)?.push(plant));

      return companyIds.map((id) => map.get(id) || []);
    },
  );

  public readonly batchCompanyContacts = new DataLoader<
    string,
    CompanyContact[]
  >(async (companyIds: readonly string[]) => {
    const contacts = await this.contactRepository.find({
      where: { companyId: In([...companyIds]) },
    });

    const map = new Map<string, CompanyContact[]>();
    companyIds.forEach((id) => map.set(id, [])); // Inicializar vacíos
    contacts.forEach((contact) => map.get(contact.companyId)?.push(contact));

    return companyIds.map((id) => map.get(id) || []);
  });

  public readonly batchPartCatalogs = new DataLoader<string, PartCatalog[]>(
    async (companyIds: readonly string[]) => {
      const partCatalogs = await this.partCatalogRepository.find({
        where: { customerId: In([...companyIds]) },
      });

      const map = new Map<string, PartCatalog[]>();
      companyIds.forEach((id) => map.set(id, [])); // Inicializar vacíos
      partCatalogs.forEach((part) => map.get(part.customerId)?.push(part));

      return companyIds.map((id) => map.get(id) || []);
    },
  );
}
