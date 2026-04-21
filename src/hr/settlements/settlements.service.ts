import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Settlement } from './entities/settlement.entity';
import { CreateSettlementInput, UpdateSettlementInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class SettlementsService {
  private readonly logger = new Logger('SettlementsService');

  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
  ) {}

  async create(
    createSettlementInput: CreateSettlementInput,
  ): Promise<Settlement> {
    try {
      const settlement = this.settlementRepository.create(
        createSettlementInput,
      );
      return await this.settlementRepository.save(settlement);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Settlement[]> {
    const { limit, offset } = paginationArgs;
    return await this.settlementRepository.find({
      take: limit,
      skip: offset,
      order: { terminationDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Settlement> {
    const settlement = await this.settlementRepository.findOneBy({ id });
    if (!settlement)
      throw new NotFoundException(`Finiquito con ID ${id} no encontrado`);
    return settlement;
  }

  async update(
    updateSettlementInput: UpdateSettlementInput,
  ): Promise<Settlement> {
    const settlement = await this.settlementRepository.preload(
      updateSettlementInput,
    );

    if (!settlement)
      throw new NotFoundException(
        `Finiquito con ID ${updateSettlementInput.id} no encontrado`,
      );

    try {
      return await this.settlementRepository.save(settlement);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async changeStatus(id: string, isActive: boolean): Promise<Settlement> {
    const settlement = await this.findOne(id);
    settlement.isActive = isActive;

    try {
      return await this.settlementRepository.save(settlement);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);
    throw new BadRequestException(
      'Error al gestionar el finiquito. Revisa los logs del servidor.',
    );
  }
}
