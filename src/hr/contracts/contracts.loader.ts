import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DataLoader from 'dataloader';

import { Employee } from '../../iam/employees/entities/employee.entity';

@Injectable({ scope: Scope.REQUEST })
export class ContractsLoader {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

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
}
