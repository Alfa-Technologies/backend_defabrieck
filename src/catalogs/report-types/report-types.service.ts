import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportTypeInput, UpdateReportTypeInput } from './dto';
import { ReportType } from './entities/report-type.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class ReportTypesService {
  private readonly logger = new Logger('ReportTypesService');

  constructor(
    @InjectRepository(ReportType)
    private readonly reportTypeRepository: Repository<ReportType>,
  ) {}

  async create(createInput: CreateReportTypeInput): Promise<ReportType> {
    try {
      const newReport = this.reportTypeRepository.create(createInput);
      return await this.reportTypeRepository.save(newReport);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al crear el tipo de reporte. Por favor, contacte al administrador.',
      );
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<ReportType[]> {
    const { limit, offset } = paginationArgs;
    return this.reportTypeRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<ReportType> {
    const report = await this.reportTypeRepository.findOneBy({ id });
    if (!report)
      throw new NotFoundException(
        `No se encontró el tipo de reporte con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return report;
  }

  async update(
    id: string,
    updateInput: UpdateReportTypeInput,
  ): Promise<ReportType> {
    const report = await this.reportTypeRepository.preload(updateInput);
    if (!report)
      throw new NotFoundException(
        `No se encontró el tipo de reporte con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    try {
      return await this.reportTypeRepository.save(report);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar el tipo de reporte. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<ReportType> {
    const report = await this.findOne(id);
    report.isActive = isActive;
    return this.reportTypeRepository.save(report);
  }

  private handleDBExceptions(error: any): never {
    // Duplicado de nombre
    if (error.code === '23505') {
      throw new ConflictException(
        `Ya existe un tipo de reporte con este nombre. Por favor, utilice otro nombre.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
