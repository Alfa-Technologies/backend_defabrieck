import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { User } from '../../iam/users/entities/user.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class QualityAuditsLoader {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  public readonly batchUsers = new DataLoader<string, User | null>(
    async (userIds: readonly string[]) => {
      const users = await this.userRepository.find({
        where: { id: In([...userIds]) },
      });

      const userMap = new Map(users.map((user) => [user.id, user]));
      return userIds.map((id) => userMap.get(id) || null);
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
}
