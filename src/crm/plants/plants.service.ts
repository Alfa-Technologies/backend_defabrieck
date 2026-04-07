import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlantInput, UpdatePlantInput } from './dto';
import { Plant } from './entities/plant.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class PlantsService {
  private readonly logger = new Logger('PlantsService');

  constructor(
    @InjectRepository(Plant)
    private readonly plantsRepository: Repository<Plant>,
  ) {}

  async create(createPlantInput: CreatePlantInput): Promise<Plant> {
    try {
      const newPlant = this.plantsRepository.create(createPlantInput);
      return await this.plantsRepository.save(newPlant);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al crear la planta. Por favor, contacte al administrador.',
      );
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Plant[]> {
    const { limit, offset } = paginationArgs;
    return this.plantsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<Plant> {
    const plant = await this.plantsRepository.findOne({
      where: { id },
    });

    if (!plant)
      throw new NotFoundException(
        `No se encontró la planta con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return plant;
  }

  async update(id: string, updatePlantInput: UpdatePlantInput): Promise<Plant> {
    const plant = await this.plantsRepository.preload(updatePlantInput);
    if (!plant)
      throw new NotFoundException(
        `No se encontró la planta con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    try {
      return await this.plantsRepository.save(plant);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar la planta. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<Plant> {
    const plant = await this.findOne(id);
    plant.isActive = isActive;
    return this.plantsRepository.save(plant);
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
        `La empresa asignada no existe en el sistema. Por favor, verifique el ID de la empresa.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
