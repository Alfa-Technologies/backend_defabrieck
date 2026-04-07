import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { Shift } from '../shifts/entities/shift.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class PersonnelAssignmentsLoader {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Plant)
    private readonly plantRepository: Repository<Plant>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
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

  public readonly batchShifts = new DataLoader<string, Shift | null>(
    async (shiftIds: readonly string[]) => {
      const shifts = await this.shiftRepository.find({
        where: { id: In([...shiftIds]) },
      });

      const shiftMap = new Map(shifts.map((shift) => [shift.id, shift]));
      return shiftIds.map((id) => shiftMap.get(id) || null);
    },
  );
}
