import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { DowntimeReason } from '../../catalogs/downtime-reasons/entities/downtime-reason.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class DowntimeLogsLoader {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(DowntimeReason)
    private readonly downtimeReasonRepository: Repository<DowntimeReason>,
  ) {}

  public readonly batchProjects = new DataLoader<string, Project | null>(
    async (projectIds: readonly string[]) => {
      const projects = await this.projectRepository.find({
        where: { id: In([...projectIds]) },
      });

      const projectMap = new Map(projects.map((project) => [project.id, project]));
      return projectIds.map((id) => projectMap.get(id) || null);
    },
  );

  public readonly batchEmployees = new DataLoader<string, Employee | null>(
    async (employeeIds: readonly string[]) => {
      const employees = await this.employeeRepository.find({
        where: { id: In([...employeeIds]) },
      });

      const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));
      return employeeIds.map((id) => employeeMap.get(id) || null);
    },
  );

  public readonly batchDowntimeReasons = new DataLoader<string, DowntimeReason | null>(
    async (downtimeReasonIds: readonly string[]) => {
      const downtimeReasons = await this.downtimeReasonRepository.find({
        where: { id: In([...downtimeReasonIds]) },
      });

      const downtimeReasonMap = new Map(downtimeReasons.map((reason) => [reason.id, reason]));
      return downtimeReasonIds.map((id) => downtimeReasonMap.get(id) || null);
    },
  );
}
