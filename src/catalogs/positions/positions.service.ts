import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePositionInput, UpdatePositionInput } from './dto';
import { Position } from './entities/position.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class PositionsService {
  private readonly logger = new Logger('PositionsService');

  constructor(
    @InjectRepository(Position)
    private readonly positionsRepository: Repository<Position>,
  ) {}

  async create(createPositionInput: CreatePositionInput): Promise<Position> {
    try {
      const newPosition = this.positionsRepository.create(createPositionInput);
      return await this.positionsRepository.save(newPosition);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al crear el puesto. Por favor, contacte al administrador.',
      );
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Position[]> {
    const { limit, offset } = paginationArgs;

    return this.positionsRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionsRepository.findOneBy({ id });
    if (!position) {
      throw new NotFoundException(
        `No se encontró el puesto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }
    return position;
  }

  async update(
    id: string,
    updatePositionInput: UpdatePositionInput,
  ): Promise<Position> {
    const position = await this.positionsRepository.preload(updatePositionInput);

    if (!position) {
      throw new NotFoundException(
        `No se encontró el puesto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }

    try {
      return await this.positionsRepository.save(position);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar el puesto. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<Position> {
    const position = await this.findOne(id);
    position.isActive = isActive;
    return this.positionsRepository.save(position);
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
