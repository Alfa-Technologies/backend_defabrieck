import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonnelAssignmentInput } from './dto/create-personnel-assignment.input';
import { UpdatePersonnelAssignmentInput } from './dto/update-personnel-assignment.input';
import { PersonnelAssignment } from './entities/personnel-assignment.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class PersonnelAssignmentsService {
  private readonly logger = new Logger('PersonnelAssignmentsService');

  constructor(
    @InjectRepository(PersonnelAssignment)
    private readonly assignmentsRepository: Repository<PersonnelAssignment>,
  ) {}

  async create(
    createInput: CreatePersonnelAssignmentInput,
  ): Promise<PersonnelAssignment> {
    try {
      const newAssignment = this.assignmentsRepository.create(createInput);
      return await this.assignmentsRepository.save(newAssignment);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(
    paginationArgs: PaginationArgs,
  ): Promise<PersonnelAssignment[]> {
    const { limit, offset } = paginationArgs;
    return this.assignmentsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<PersonnelAssignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
    });
    if (!assignment)
      throw new NotFoundException(
        `No se encontró la asignación de personal con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return assignment;
  }

  async update(
    id: string,
    updateInput: UpdatePersonnelAssignmentInput,
  ): Promise<PersonnelAssignment> {
    const assignment = await this.assignmentsRepository.preload(updateInput);
    if (!assignment)
      throw new NotFoundException(
        `No se encontró la asignación de personal con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    try {
      return await this.assignmentsRepository.save(assignment);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar la asignación de personal. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<PersonnelAssignment> {
    const assignment = await this.findOne(id);
    assignment.isActive = isActive;
    return await this.assignmentsRepository.save(assignment);
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
        `El empleado, planta o turno asignado no existe en el sistema. Por favor, verifique que todas las relaciones sean válidas.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
