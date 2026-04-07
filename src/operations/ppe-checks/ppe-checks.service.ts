import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePpeCheckInput } from './dto/create-ppe-check.input';
import { PpeCheck } from './entities/ppe-check.entity';
import { User } from '../../iam/users/entities/user.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class PpeChecksService {
  constructor(
    @InjectRepository(PpeCheck)
    private readonly ppeRepository: Repository<PpeCheck>,
  ) {}

  async create(
    createInput: CreatePpeCheckInput,
    auditor: User,
  ): Promise<PpeCheck> {
    const newCheck = this.ppeRepository.create({
      ...createInput,
      auditor: auditor,
    });
    return await this.ppeRepository.save(newCheck);
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PpeCheck[]> {
    const { limit, offset } = paginationArgs;
    return this.ppeRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<PpeCheck> {
    const check = await this.ppeRepository.findOneBy({ id });
    if (!check)
      throw new NotFoundException(
        `No se encontró la verificación de EPP con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return check;
  }

  async findByProject(projectId: string): Promise<PpeCheck[]> {
    return this.ppeRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<PpeCheck> {
    const check = await this.findOne(id);
    return await this.ppeRepository.remove(check);
  }
}
