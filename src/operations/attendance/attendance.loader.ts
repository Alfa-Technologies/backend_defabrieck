import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { User } from '../../iam/users/entities/user.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class AttendanceLoader {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Plant)
    private readonly plantRepository: Repository<Plant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public readonly batchEmployees = new DataLoader<string, Employee | null>(
    async (employeeIds: readonly string[]) => {
      const employees = await this.employeeRepository.find({
        where: { id: In([...employeeIds]) },
      });

      const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));
      return employeeIds.map((id) => employeeMap.get(id) || null);
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

  public readonly batchUsers = new DataLoader<string, User | null>(
    async (userIds: readonly string[]) => {
      const users = await this.userRepository.find({
        where: { id: In([...userIds]) },
      });

      const userMap = new Map(users.map((user) => [user.id, user]));
      return userIds.map((id) => userMap.get(id) || null);
    },
  );
}
