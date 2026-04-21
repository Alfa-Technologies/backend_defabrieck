import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PurchaseOrder } from './entities/purchase-order.entity';
import { CreatePurchaseOrderInput, UpdatePurchaseOrderInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger('PurchaseOrdersService');

  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
  ) {}

  async create(
    createPoInput: CreatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    try {
      const po = this.poRepository.create(createPoInput);
      return await this.poRepository.save(po);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PurchaseOrder[]> {
    const { limit, offset } = paginationArgs;
    return await this.poRepository.find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOneBy({ id });
    if (!po)
      throw new NotFoundException(`Orden de Compra con ID ${id} no encontrada`);
    return po;
  }

  async update(
    id: string,
    updatePoInput: UpdatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    const { id: _, ...rest } = updatePoInput;
    const po = await this.poRepository.preload({
      id,
      ...rest,
    });

    if (!po)
      throw new NotFoundException(`Orden de Compra con ID ${id} no encontrada`);

    try {
      return await this.poRepository.save(po);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async changeStatus(id: string, isActive: boolean): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    po.isActive = isActive;

    try {
      return await this.poRepository.save(po);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505')
      throw new BadRequestException('El número de OC ya existe.');
    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado al gestionar la OC. Revisa los logs.',
    );
  }
}
