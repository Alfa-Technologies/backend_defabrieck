import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePartCatalogInput, UpdatePartCatalogInput } from './dto';
import { PartCatalog } from './entities/part-catalog.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class PartCatalogService {
  private readonly logger = new Logger('PartCatalogService');

  constructor(
    @InjectRepository(PartCatalog)
    private readonly partCatalogRepository: Repository<PartCatalog>,
  ) {}

  async create(createInput: CreatePartCatalogInput): Promise<PartCatalog> {
    try {
      const newPart = this.partCatalogRepository.create(createInput);
      return await this.partCatalogRepository.save(newPart);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PartCatalog[]> {
    const { limit, offset } = paginationArgs;
    return this.partCatalogRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<PartCatalog> {
    const part = await this.partCatalogRepository.findOneBy({ id });
    if (!part)
      throw new NotFoundException(
        `No se encontró la parte con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return part;
  }

  async update(
    id: string,
    updateInput: UpdatePartCatalogInput,
  ): Promise<PartCatalog> {
    const part = await this.partCatalogRepository.preload(updateInput);
    if (!part)
      throw new NotFoundException(
        `No se encontró la parte con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return this.partCatalogRepository.save(part);
  }

  async remove(id: string, isActive: boolean): Promise<PartCatalog> {
    const part = await this.findOne(id);
    part.isActive = isActive;
    return this.partCatalogRepository.save(part);
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
        `La empresa asignada no existe en el sistema. Por favor, verifique que la empresa esté registrada primero.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
