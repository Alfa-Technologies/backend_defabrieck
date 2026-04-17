import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contract } from './entities/contract.entity';
import { CreateContractInput, UpdateContractInput } from './dto';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger('ContractsService');

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async create(createContractInput: CreateContractInput): Promise<Contract> {
    try {
      const contract = this.contractRepository.create(createContractInput);
      return await this.contractRepository.save(contract);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(): Promise<Contract[]> {
    return await this.contractRepository.find({
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOneBy({ id });
    if (!contract)
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    return contract;
  }

  async update(updateContractInput: UpdateContractInput): Promise<Contract> {
    const contract = await this.contractRepository.preload(updateContractInput);

    if (!contract)
      throw new NotFoundException(
        `Contrato con ID ${updateContractInput.id} no encontrado`,
      );

    try {
      return await this.contractRepository.save(contract);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<boolean> {
    const contract = await this.findOne(id);
    await this.contractRepository.remove(contract);
    return true;
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);
    throw new BadRequestException(
      'Error al gestionar el contrato. Revisa los logs del servidor.',
    );
  }
}
