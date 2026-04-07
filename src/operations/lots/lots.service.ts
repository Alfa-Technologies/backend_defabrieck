import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLotInput, UpdateLotInput } from './dto';
import { Lot } from './entities/lot.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class LotsService {
  private readonly logger = new Logger('LotsService');

  constructor(
    @InjectRepository(Lot)
    private readonly lotsRepository: Repository<Lot>,
  ) {}

  async create(createInput: CreateLotInput): Promise<Lot> {
    try {
      const newLot = this.lotsRepository.create(createInput);
      return await this.lotsRepository.save(newLot);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Lot[]> {
    const { limit, offset } = paginationArgs;
    return this.lotsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<Lot> {
    const lot = await this.lotsRepository.findOne({
      where: { id },
    });
    if (!lot)
      throw new NotFoundException(
        `No se encontró el lote con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return lot;
  }

  async update(id: string, updateInput: UpdateLotInput): Promise<Lot> {
    const lot = await this.lotsRepository.preload(updateInput);
    if (!lot)
      throw new NotFoundException(
        `No se encontró el lote con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    try {
      return await this.lotsRepository.save(lot);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar el lote. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<Lot> {
    const lot = await this.findOne(id);
    lot.isActive = isActive;
    return this.lotsRepository.save(lot);
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
        `El proyecto asignado no existe en el sistema. Por favor, verifique que el proyecto esté registrado primero.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
