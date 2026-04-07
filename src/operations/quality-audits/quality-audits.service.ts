import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQualityAuditInput } from './dto/create-quality-audit.input';
import { QualityAudit } from './entities/quality-audit.entity';
import { User } from '../../iam/users/entities/user.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class QualityAuditsService {
  private readonly logger = new Logger('QualityAuditsService');

  constructor(
    @InjectRepository(QualityAudit)
    private readonly auditRepository: Repository<QualityAudit>,
  ) {}

  async create(
    createInput: CreateQualityAuditInput,
    auditor: User,
  ): Promise<QualityAudit> {
    try {
      const newAudit = this.auditRepository.create({
        ...createInput,
        auditor: auditor,
      });

      return await this.auditRepository.save(newAudit);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al crear la auditoría de calidad. Por favor, contacte al administrador.',
      );
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<QualityAudit[]> {
    const { limit, offset } = paginationArgs;
    return this.auditRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<QualityAudit> {
    const audit = await this.auditRepository.findOneBy({ id });
    if (!audit)
      throw new NotFoundException(
        `No se encontró la auditoría de calidad con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return audit;
  }

  async findByProject(projectId: string): Promise<QualityAudit[]> {
    return this.auditRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
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
        `El proyecto o empleado asignado no existe en el sistema. Por favor, verifique que todas las relaciones sean válidas.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
