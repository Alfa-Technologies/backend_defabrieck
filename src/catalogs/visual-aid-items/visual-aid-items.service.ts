import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVisualAidItemInput, UpdateVisualAidItemInput } from './dto';
import { VisualAidItem } from './entities/visual-aid-item.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class VisualAidItemsService {
  private readonly logger = new Logger('VisualAidItemsService');

  constructor(
    @InjectRepository(VisualAidItem)
    private readonly itemsRepository: Repository<VisualAidItem>,
  ) {}

  async create(createInput: CreateVisualAidItemInput): Promise<VisualAidItem> {
    try {
      const newItem = this.itemsRepository.create(createInput);
      return await this.itemsRepository.save(newItem);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<VisualAidItem[]> {
    const { limit, offset } = paginationArgs;
    return this.itemsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<VisualAidItem> {
    const item = await this.itemsRepository.findOne({
      where: { id },
    });
    if (!item)
      throw new NotFoundException(
        `No se encontró el ítem de ayuda visual con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return item;
  }

  async update(
    id: string,
    updateInput: UpdateVisualAidItemInput,
  ): Promise<VisualAidItem> {
    const item = await this.itemsRepository.preload(updateInput);
    if (!item)
      throw new NotFoundException(
        `No se encontró el ítem de ayuda visual con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return this.itemsRepository.save(item);
  }

  async remove(id: string, isActive: boolean): Promise<VisualAidItem> {
    const item = await this.findOne(id);
    item.isActive = isActive;
    return this.itemsRepository.save(item);
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23503') {
      throw new BadRequestException(
        `El documento de ayuda visual o tipo de defecto asignado no existe en el sistema. Por favor, verifique que las relaciones sean válidas.`,
      );
    }
    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
