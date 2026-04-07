import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class UsersLoader {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(CompanyContact)
    private readonly contactRepository: Repository<CompanyContact>,
  ) {}

  public readonly batchEmployees = new DataLoader<string, Employee | null>(
    async (userIds: readonly string[]) => {
      const employees = await this.employeeRepository.find({
        where: { userId: In([...userIds]) },
      });

      const employeeMap = new Map(employees.map((emp) => [emp.userId, emp]));
      return userIds.map((id) => employeeMap.get(id) || null);
    },
  );

  public readonly batchContacts = new DataLoader<string, CompanyContact | null>(
    async (userIds: readonly string[]) => {
      const contacts = await this.contactRepository.find({
        where: { userId: In([...userIds]) },
      });
      const contactMap = new Map(
        contacts.map((contact) => [contact.userId, contact]),
      );
      return userIds.map((id) => contactMap.get(id) || null);
    },
  );
}
