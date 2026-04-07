import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDowntimeLogInput } from './dto/create-downtime-log.input';
import { UpdateDowntimeLogInput } from './dto/update-downtime-log.input';
import { DowntimeLog } from './entities/downtime-log.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class DowntimeLogsService {
  private readonly logger = new Logger('DowntimeLogsService');

  constructor(
    @InjectRepository(DowntimeLog)
    private readonly logsRepository: Repository<DowntimeLog>,
  ) {}

  async create(createInput: CreateDowntimeLogInput): Promise<DowntimeLog> {
    const newLog = this.logsRepository.create({
      ...createInput,
      startTime: createInput.startTime || new Date(),
      isClosed: false,
    });
    return await this.logsRepository.save(newLog);
  }

  async findAll(paginationArgs: PaginationArgs): Promise<DowntimeLog[]> {
    const { limit, offset } = paginationArgs;

    return this.logsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<DowntimeLog> {
    const log = await this.logsRepository.findOne({
      where: { id },
    });
    if (!log)
      throw new NotFoundException(
        `No se encontró el registro de tiempo muerto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return log;
  }

  async update(
    id: string,
    updateInput: UpdateDowntimeLogInput,
  ): Promise<DowntimeLog> {
    try {
      const log = await this.findOne(id);

      this.logsRepository.merge(log, updateInput);

      if (updateInput.endTime) {
        const start = new Date(log.startTime).getTime();
        const end = new Date(updateInput.endTime).getTime();

        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 60000);

        log.minutes = diffMins > 0 ? diffMins : 0;
        log.isClosed = true;
      }

      return await this.logsRepository.save(log);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar el registro de tiempo muerto. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string): Promise<DowntimeLog> {
    const log = await this.findOne(id);
    return await this.logsRepository.remove(log);
  }

  async findByProject(
    projectId: string,
    paginationArgs: PaginationArgs,
  ): Promise<DowntimeLog[]> {
    const { limit, offset } = paginationArgs;

    return this.logsRepository.find({
      where: { projectId },
      take: limit,
      skip: offset,
    });
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
        `El proyecto, empleado o razón de tiempo muerto asignado no existe en el sistema. Por favor, verifique que todas las relaciones sean válidas.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
