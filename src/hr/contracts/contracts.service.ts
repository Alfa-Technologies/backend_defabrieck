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
import { PaginationArgs } from '../../common/dto/args/pagination.args';

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

  async findAll(paginationArgs: PaginationArgs): Promise<Contract[]> {
    const { limit, offset } = paginationArgs;
    return await this.contractRepository.find({
      take: limit,
      skip: offset,
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

  async changeStatus(id: string, isActive: boolean): Promise<Contract> {
    const contract = await this.findOne(id);
    contract.isActive = isActive;

    try {
      return await this.contractRepository.save(contract);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);
    throw new BadRequestException(
      'Error al gestionar el contrato. Revisa los logs del servidor.',
    );
  }
}
