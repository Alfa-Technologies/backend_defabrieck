import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDowntimeReasonInput, UpdateDowntimeReasonInput } from './dto';
import { DowntimeReason } from './entities/downtime-reason.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class DowntimeReasonsService {
  private readonly logger = new Logger('DowntimeReasonsService');

  constructor(
    @InjectRepository(DowntimeReason)
    private readonly downtimeRepository: Repository<DowntimeReason>,
  ) {}

  async create(
    createInput: CreateDowntimeReasonInput,
  ): Promise<DowntimeReason> {
    try {
      const newReason = this.downtimeRepository.create(createInput);
      return await this.downtimeRepository.save(newReason);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<DowntimeReason[]> {
    const { limit, offset } = paginationArgs;
    return this.downtimeRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<DowntimeReason> {
    const reason = await this.downtimeRepository.findOneBy({ id });
    if (!reason)
      throw new NotFoundException(
        `No se encontró la razón de tiempo muerto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return reason;
  }

  async update(
    id: string,
    updateInput: UpdateDowntimeReasonInput,
  ): Promise<DowntimeReason> {
    const reason = await this.downtimeRepository.preload(updateInput);
    if (!reason)
      throw new NotFoundException(
        `No se encontró la razón de tiempo muerto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    try {
      return await this.downtimeRepository.save(reason);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar la razón de tiempo muerto. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<DowntimeReason> {
    const reason = await this.findOne(id);
    reason.isActive = isActive;
    return this.downtimeRepository.save(reason);
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      const field = error.detail?.match(/\((.*?)\)/)?.[1] || 'proporcionado';
      throw new ConflictException(
        `El dato duplicado en ${field} ya existe en otro registro.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
