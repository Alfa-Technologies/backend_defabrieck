import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeInput, UpdateEmployeeInput } from './dto';
import { Employee } from './entities/employee.entity';
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
  ) {}

  async create(createEmployeeInput: CreateEmployeeInput): Promise<Employee> {
    const { userId, ...rest } = createEmployeeInput;

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

    try {
      const newEmployee = this.employeesRepository.create({
        ...rest,
        user: userArg,
        email: userEmail || rest.email,
      });

      return await this.employeesRepository.save(newEmployee);
    } catch (error) {
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
    const { userId, id: _, ...rest } = updateInput as any;

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
      return await this.employeesRepository.save(employee);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, isActive: boolean): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.isActive = isActive;

    try {
      return await this.employeesRepository.save(employee);
    } catch (error) {
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
