import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectPart } from './entities/project-part.entity';
import { CreateProjectPartInput, UpdateProjectPartInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

import { PartCatalogService } from '../../catalogs/part-catalog/part-catalog.service';
import { User } from 'src/iam/users/entities/user.entity';

@Injectable()
export class ProjectPartsService {
  private readonly logger = new Logger('ProjectPartsService');

  constructor(
    @InjectRepository(ProjectPart)
    private readonly projectPartRepository: Repository<ProjectPart>,
    private readonly partCatalogService: PartCatalogService,
  ) {}

  async create(
    createInput: CreateProjectPartInput,
    user: User,
  ): Promise<ProjectPart> {
    try {
      let description = createInput.description;

      // Si hay un catálogo asociado, usamos su descripción como fallback
      if (createInput.partCatalogId) {
        const catalogPart = await this.partCatalogService.findOne(
          createInput.partCatalogId,
        );
        description = description || catalogPart.description;
      }

      const newProjectPart = this.projectPartRepository.create({
        ...createInput,
        description,
      });

      return await this.projectPartRepository.save(newProjectPart, {
        data: { userId: user.id },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<ProjectPart[]> {
    const { limit, offset } = paginationArgs;
    return this.projectPartRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<ProjectPart> {
    const part = await this.projectPartRepository.findOne({
      where: { id },
    });
    if (!part)
      throw new NotFoundException(
        `No se encontró la parte del proyecto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return part;
  }

  async update(
    id: string,
    updateInput: UpdateProjectPartInput,
    user: User,
  ): Promise<ProjectPart> {
    const part = await this.projectPartRepository.preload(updateInput);
    if (!part)
      throw new NotFoundException(
        `No se encontró la parte del proyecto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    return this.projectPartRepository.save(part, {
      data: { userId: user.id },
    });
  }

  async remove(
    id: string,
    isActive: boolean,
    user: User,
  ): Promise<ProjectPart> {
    const part = await this.findOne(id);
    part.isActive = isActive;

    return this.projectPartRepository.save(part, {
      data: { userId: user.id },
    });
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23503') {
      throw new BadRequestException(
        `El proyecto o parte de catálogo asignado no existe en el sistema. Por favor, verifique que las relaciones sean válidas.`,
      );
    }
    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
