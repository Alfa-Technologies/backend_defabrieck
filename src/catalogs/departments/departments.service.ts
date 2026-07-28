import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentInput, UpdateDepartmentInput } from './dto';
import { Department } from './entities/department.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger('DepartmentsService');

  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  async create(createDepartmentInput: CreateDepartmentInput): Promise<Department> {
    try {
      const newDepartment = this.departmentsRepository.create(createDepartmentInput);
      return await this.departmentsRepository.save(newDepartment);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al crear el departamento. Por favor, contacte al administrador.',
      );
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Department[]> {
    const { limit, offset } = paginationArgs;

    return this.departmentsRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentsRepository.findOneBy({ id });
    if (!department) {
      throw new NotFoundException(
        `No se encontró el departamento con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }
    return department;
  }

  async update(
    id: string,
    updateDepartmentInput: UpdateDepartmentInput,
  ): Promise<Department> {
    const department = await this.departmentsRepository.preload(updateDepartmentInput);

    if (!department) {
      throw new NotFoundException(
        `No se encontró el departamento con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }

    try {
      return await this.departmentsRepository.save(department);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar el departamento. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<Department> {
    const department = await this.findOne(id);
    department.isActive = isActive;
    return this.departmentsRepository.save(department);
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      const field = error.detail?.match(/\((.*?)\)/)?.[1] || 'proporcionado';
      throw new ConflictException(
        `El dato duplicado en ${field} ya existe en otro registro.`,
      );
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        `La referencia proporcionada no existe en el sistema. Verifique que todos los datos relacionados sean válidos.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
