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

  async findAll(): Promise<Settlement[]> {
    return await this.settlementRepository.find({
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

  async remove(id: string): Promise<boolean> {
    const settlement = await this.findOne(id);
    await this.settlementRepository.remove(settlement);
    return true;
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);
    throw new BadRequestException(
      'Error al gestionar el finiquito. Revisa los logs del servidor.',
    );
  }
}
