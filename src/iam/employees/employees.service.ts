import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeInput, UpdateEmployeeInput } from './dto';
import { Employee } from './entities/employee.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { User } from '../users/entities/user.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger('EmployeesService');

  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Beneficiary)
    private readonly beneficiariesRepository: Repository<Beneficiary>,
  ) {}

  async create(createEmployeeInput: CreateEmployeeInput): Promise<Employee> {
    const { userId, beneficiaries, ...rest } = createEmployeeInput;

    let userArg: { id: string } | undefined = undefined;
    let userEmail: string | undefined = undefined;

    if (userId) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(
          `No se encontró el usuario con el ID ${userId}. Verifique que el identificador sea correcto.`,
        );
      }
      userArg = { id: userId };
      userEmail = user.email;
    }

    if (beneficiaries && beneficiaries.length > 0) {
      this.validateBeneficiaryPercentages(beneficiaries);
    }

    try {
      const newEmployee = this.employeesRepository.create({
        ...rest,
        user: userArg,
        email: userEmail || rest.email,
        beneficiaries: beneficiaries?.map((b) =>
          this.beneficiariesRepository.create(b),
        ),
      });

      if (newEmployee.beneficiaries && newEmployee.beneficiaries.length > 0) {
        newEmployee.beneficiaries = newEmployee.beneficiaries.map((ben) => {
          ben.employee = newEmployee;
          return ben;
        });
      }

      return await this.employeesRepository.save(newEmployee);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Employee[]> {
    const { limit, offset } = paginationArgs;
    return this.employeesRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
    });
    if (!employee)
      throw new NotFoundException(
        `No se encontró el empleado con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return employee;
  }

  async findByUserId(userId: string): Promise<Employee | null> {
    const employee = await this.employeesRepository.findOne({
      where: { userId },
    });
    return employee;
  }

  async update(
    id: string,
    updateInput: UpdateEmployeeInput,
  ): Promise<Employee> {
    const { userId, id: _, beneficiaries, ...rest } = updateInput as any;

    const employee = await this.employeesRepository.preload({
      id,
      ...rest,
    });

    if (!employee)
      throw new NotFoundException(
        `No se encontró el empleado con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    if (userId !== undefined) {
      if (userId) {
        const user = await this.usersRepository.findOne({
          where: { id: userId },
        });
        if (!user) {
          throw new NotFoundException(
            `No se encontró el usuario con el ID ${userId}. Verifique que el identificador sea correcto.`,
          );
        }
        employee.userId = userId;
        employee.email = user.email;
      } else {
        employee.userId = undefined;
        employee.user = null as any;
      }
    }

    try {
      const savedEmployee = await this.employeesRepository.save(employee);

      if (beneficiaries !== undefined) {
        await this.syncBeneficiaries(id, beneficiaries);
      }

      return savedEmployee;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  private async syncBeneficiaries(
    employeeId: string,
    beneficiaries: Array<{
      id?: string;
      fullName?: string;
      relationship?: string;
      contactPhone?: string;
      percentage?: number;
    }>,
  ): Promise<void> {
    const existing = await this.beneficiariesRepository.find({
      where: { employeeId },
    });

    const incomingIds = beneficiaries
      .map((b) => b.id)
      .filter((bid): bid is string => !!bid);

    const toRemove = existing.filter((e) => !incomingIds.includes(e.id));
    if (toRemove.length > 0) {
      await this.beneficiariesRepository.remove(toRemove);
    }

    const completeList: Array<{
      fullName: string;
      relationship: string;
      contactPhone?: string;
      percentage: number;
    }> = [];

    for (const incoming of beneficiaries) {
      if (incoming.id) {
        const current = existing.find((e) => e.id === incoming.id);
        if (!current) {
          throw new NotFoundException(
            `No se encontró el beneficiario con el ID ${incoming.id} para el empleado ${employeeId}.`,
          );
        }
        completeList.push({
          fullName: incoming.fullName ?? current.fullName,
          relationship: incoming.relationship ?? current.relationship,
          contactPhone: incoming.contactPhone ?? current.contactPhone,
          percentage: incoming.percentage ?? Number(current.percentage),
        });
      } else {
        if (
          !incoming.fullName ||
          !incoming.relationship ||
          incoming.percentage === undefined
        ) {
          throw new BadRequestException(
            'Los nuevos beneficiarios requieren nombre completo, parentesco y porcentaje.',
          );
        }
        completeList.push({
          fullName: incoming.fullName,
          relationship: incoming.relationship,
          contactPhone: incoming.contactPhone,
          percentage: incoming.percentage,
        });
      }
    }

    if (completeList.length > 0) {
      this.validateBeneficiaryPercentages(completeList);
    }

    for (const incoming of beneficiaries) {
      if (incoming.id) {
        await this.beneficiariesRepository.update(incoming.id, {
          ...(incoming.fullName !== undefined && {
            fullName: incoming.fullName,
          }),
          ...(incoming.relationship !== undefined && {
            relationship: incoming.relationship,
          }),
          ...(incoming.contactPhone !== undefined && {
            contactPhone: incoming.contactPhone,
          }),
          ...(incoming.percentage !== undefined && {
            percentage: incoming.percentage,
          }),
        });
      } else {
        const created = this.beneficiariesRepository.create({
          employeeId,
          fullName: incoming.fullName!,
          relationship: incoming.relationship!,
          contactPhone: incoming.contactPhone,
          percentage: incoming.percentage!,
        });
        await this.beneficiariesRepository.save(created);
      }
    }
  }

  private validateBeneficiaryPercentages(
    beneficiaries: Array<{ percentage: number }>,
  ): void {
    const total = beneficiaries.reduce(
      (sum, b) => sum + Number(b.percentage),
      0,
    );
    if (Math.round(total * 100) / 100 !== 100) {
      throw new BadRequestException(
        `La suma de los porcentajes de los beneficiarios debe ser exactamente 100. Total recibido: ${total}.`,
      );
    }
  }

  async findBeneficiariesByEmployeeId(
    employeeId: string,
  ): Promise<Beneficiary[]> {
    return this.beneficiariesRepository.find({
      where: { employeeId },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string, isActive: boolean): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.isActive = isActive;

    try {
      return await this.employeesRepository.save(employee);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  async updateEmployeeSalary(
    id: string,
    dailySalary: number,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    employee.dailySalary = dailySalary;

    try {
      return await this.employeesRepository.save(employee);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      const field = error.detail?.match(/\((.*?)\)/)?.[1] || 'proporcionado';
      throw new ConflictException(
        `El dato '${field}' ya está registrado en otro empleado. Por favor, verifique y utilice uno diferente.`,
      );
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        `El registro asignado (Usuario, Departamento, etc.) no existe en el sistema. Por favor, verifique las relaciones.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos al gestionar empleados. Por favor, contacte al administrador.',
    );
  }
}
