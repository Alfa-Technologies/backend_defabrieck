import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShiftInput, UpdateShiftInput } from './dto';
import { Shift } from './entities/shift.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { User } from 'src/iam/users/entities/user.entity';

@Injectable()
export class ShiftsService {
  private readonly logger = new Logger('ShiftsService');

  constructor(
    @InjectRepository(Shift)
    private readonly shiftsRepository: Repository<Shift>,
  ) {}

  async create(createInput: CreateShiftInput, user: User): Promise<Shift> {
    try {
      const newShift = this.shiftsRepository.create(createInput);

      return await this.shiftsRepository.save(newShift, {
        data: { userId: user.id },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Shift[]> {
    const { limit, offset } = paginationArgs;
    return this.shiftsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
    });
    if (!shift)
      throw new NotFoundException(
        `No se encontró el turno con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return shift;
  }

  async update(
    id: string,
    updateInput: UpdateShiftInput,
    user: User,
  ): Promise<Shift> {
    const shift = await this.shiftsRepository.preload(updateInput);
    if (!shift)
      throw new NotFoundException(
        `No se encontró el turno con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    try {
      return await this.shiftsRepository.save(shift, {
        data: { userId: user.id },
      });
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar el turno. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean, user: User): Promise<Shift> {
    const shift = await this.findOne(id);
    shift.isActive = isActive;

    return await this.shiftsRepository.save(shift, {
      data: { userId: user.id },
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
        `La planta o proyecto asignado no existe en el sistema. Por favor, verifique que las relaciones sean válidas.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
