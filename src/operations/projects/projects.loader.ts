import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Company } from '../../crm/companies/entities/company.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { ReportType } from '../../catalogs/report-types/entities/report-type.entity';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { ProjectLog } from './entities/project-log.entity';
import { ProjectPart } from '../project-parts/entities/project-part.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { ProjectProcessFlow } from './entities/project-process-flow.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class ProjectsLoader {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Plant)
    private readonly plantRepository: Repository<Plant>,
    @InjectRepository(ReportType)
    private readonly reportTypeRepository: Repository<ReportType>,
    @InjectRepository(CompanyContact)
    private readonly companyContactRepository: Repository<CompanyContact>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(ProjectLog)
    private readonly projectLogRepository: Repository<ProjectLog>,
    @InjectRepository(ProjectPart)
    private readonly projectPartRepository: Repository<ProjectPart>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(ProjectProcessFlow)
    private readonly projectProcessFlowRepository: Repository<ProjectProcessFlow>,
  ) {}

  public readonly batchCompanies = new DataLoader<string, Company | null>(
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

  public readonly batchPlants = new DataLoader<string, Plant | null>(
    async (plantIds: readonly string[]) => {
      const plants = await this.plantRepository.find({
        where: { id: In([...plantIds]) },
      });

      const plantMap = new Map(plants.map((plant) => [plant.id, plant]));
      return plantIds.map((id) => plantMap.get(id) || null);
    },
  );

  public readonly batchReportTypes = new DataLoader<string, ReportType | null>(
    async (reportTypeIds: readonly string[]) => {
      const reportTypes = await this.reportTypeRepository.find({
        where: { id: In([...reportTypeIds]) },
      });

      const reportTypeMap = new Map(reportTypes.map((type) => [type.id, type]));
      return reportTypeIds.map((id) => reportTypeMap.get(id) || null);
    },
  );

  public readonly batchCompanyContacts = new DataLoader<
    string,
    CompanyContact | null
  >(async (contactIds: readonly string[]) => {
    const contacts = await this.companyContactRepository.find({
      where: { id: In([...contactIds]) },
    });

    const contactMap = new Map(
      contacts.map((contact) => [contact.id, contact]),
    );
    return contactIds.map((id) => contactMap.get(id) || null);
  });

  public readonly batchEmployees = new DataLoader<string, Employee | null>(
    async (employeeIds: readonly string[]) => {
      const employees = await this.employeeRepository.find({
        where: { id: In([...employeeIds]) },
      });

      const employeeMap = new Map(
        employees.map((employee) => [employee.id, employee]),
      );
      return employeeIds.map((id) => employeeMap.get(id) || null);
    },
  );

  public readonly batchProjectLogs = new DataLoader<string, ProjectLog[]>(
    async (projectIds: readonly string[]) => {
      const logs = await this.projectLogRepository.find({
        where: { projectId: In([...projectIds]) },
      });

      const map = new Map<string, ProjectLog[]>();
      projectIds.forEach((id) => map.set(id, [])); // Inicializar vacíos
      logs.forEach((log) => map.get(log.projectId)?.push(log));

      return projectIds.map((id) => map.get(id) || []);
    },
  );

  public readonly batchProjectParts = new DataLoader<string, ProjectPart[]>(
    async (projectIds: readonly string[]) => {
      const parts = await this.projectPartRepository.find({
        where: { projectId: In([...projectIds]) },
      });

      const map = new Map<string, ProjectPart[]>();
      projectIds.forEach((id) => map.set(id, [])); // Inicializar vacíos
      parts.forEach((part) => map.get(part.projectId)?.push(part));

      return projectIds.map((id) => map.get(id) || []);
    },
  );

  public readonly batchShifts = new DataLoader<string, Shift[]>(
    async (projectIds: readonly string[]) => {
      const shifts = await this.shiftRepository.find({
        where: { projectId: In([...projectIds]) },
      });

      const map = new Map<string, Shift[]>();
      projectIds.forEach((id) => map.set(id, [])); // Inicializar vacíos
      shifts.forEach((shift) => map.get(shift.projectId)?.push(shift));

      return projectIds.map((id) => map.get(id) || []);
    },
  );

  public readonly batchProjectProcessFlows = new DataLoader<
    string,
    ProjectProcessFlow[]
  >(async (projectIds: readonly string[]) => {
    const processFlows = await this.projectProcessFlowRepository.find({
      where: { projectId: In([...projectIds]) },
    });

    const map = new Map<string, ProjectProcessFlow[]>();
    projectIds.forEach((id) => map.set(id, [])); // Inicializar vacíos
    processFlows.forEach((flow) => map.get(flow.projectId)?.push(flow));

    return projectIds.map((id) => map.get(id) || []);
  });
}
