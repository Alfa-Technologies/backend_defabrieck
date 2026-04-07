import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateProjectReportConfigInput,
  UpdateProjectReportConfigInput,
} from './dto';
import { ProjectReportConfig } from './entities/project-report-config.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { User } from '../../iam/users/entities/user.entity';

@Injectable()
export class ProjectReportConfigService {
  private readonly logger = new Logger('ProjectReportConfigService');

  constructor(
    @InjectRepository(ProjectReportConfig)
    private readonly configRepository: Repository<ProjectReportConfig>,
  ) {}

  async create(
    createInput: CreateProjectReportConfigInput,
    user: User,
  ): Promise<ProjectReportConfig> {
    try {
      const existingConfig = await this.configRepository.findOneBy({
        projectId: createInput.projectId,
      });

      if (existingConfig) {
        throw new BadRequestException(
          `El proyecto ${createInput.projectId} ya tiene una configuración de reporte. Por favor, utilice la opción de actualizar en su lugar.`,
        );
      }

      const newConfig = this.configRepository.create(createInput);

      return await this.configRepository.save(newConfig, {
        data: { userId: user.id },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(
    paginationArgs: PaginationArgs,
  ): Promise<ProjectReportConfig[]> {
    const { limit, offset } = paginationArgs;
    return this.configRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<ProjectReportConfig> {
    const config = await this.configRepository.findOne({
      where: { id },
    });
    if (!config)
      throw new NotFoundException(
        `No se encontró la configuración del reporte con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return config;
  }

  async findByProjectId(
    projectId: string,
  ): Promise<ProjectReportConfig | null> {
    const config = await this.configRepository.findOneBy({ projectId });
    return config;
  }

  async update(
    id: string,
    updateInput: UpdateProjectReportConfigInput,
    user: User,
  ): Promise<ProjectReportConfig> {
    const config = await this.configRepository.preload(updateInput);
    if (!config)
      throw new NotFoundException(
        `No se encontró la configuración del reporte con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    return this.configRepository.save(config, {
      data: { userId: user.id },
    });
  }

  async remove(
    id: string,
    isActive: boolean,
    user: User,
  ): Promise<ProjectReportConfig> {
    const config = await this.findOne(id);
    config.isActive = isActive;

    return await this.configRepository.save(config, {
      data: { userId: user.id },
    });
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException(
        `La configuración ya existe para este proyecto. Por favor, utilice otra configuración o actualice la existente.`,
      );
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        `El proyecto asignado no existe en el sistema. Por favor, verifique que el proyecto esté registrado primero.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
