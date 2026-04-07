import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDefectTypeInput, UpdateDefectTypeInput } from './dto';
import { DefectType } from './entities/defect-type.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class DefectTypesService {
  private readonly logger = new Logger('DefectTypesService');

  constructor(
    @InjectRepository(DefectType)
    private readonly defectTypeRepository: Repository<DefectType>,
  ) {}

  async create(createInput: CreateDefectTypeInput): Promise<DefectType> {
    try {
      const newDefect = this.defectTypeRepository.create(createInput);
      return await this.defectTypeRepository.save(newDefect);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(
    paginationArgs: PaginationArgs,
    partId?: string,
  ): Promise<DefectType[]> {
    const { limit, offset } = paginationArgs;

    const whereConditions: any = {};
    if (partId) {
      whereConditions.partId = partId;
    }

    return this.defectTypeRepository.find({
      where: whereConditions,
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<DefectType> {
    const defect = await this.defectTypeRepository.findOneBy({ id });
    if (!defect)
      throw new NotFoundException(
        `No se encontró el tipo de defecto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return defect;
  }

  async update(
    id: string,
    updateInput: UpdateDefectTypeInput,
  ): Promise<DefectType> {
    const defect = await this.defectTypeRepository.preload(updateInput);
    if (!defect)
      throw new NotFoundException(
        `No se encontró el tipo de defecto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    try {
      return await this.defectTypeRepository.save(defect);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar el tipo de defecto. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<DefectType> {
    const defect = await this.findOne(id);
    defect.isActive = isActive;
    return this.defectTypeRepository.save(defect);
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
