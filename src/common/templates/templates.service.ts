import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTemplateInput, UpdateTemplateInput } from './dto';
import { Template } from './entities/template.entity';
import { PaginationArgs } from '../dto/args/pagination.args';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async create(createInput: CreateTemplateInput): Promise<Template> {
    try {
      const newTemplate = this.templateRepository.create(createInput);
      return await this.templateRepository.save(newTemplate);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException(
          `La plantilla con código ${createInput.code} ya existe en el sistema.`,
        );
      throw error;
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Template[]> {
    const { limit, offset } = paginationArgs;
    return this.templateRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findByCode(code: string): Promise<Template> {
    const template = await this.templateRepository.findOneBy({ code });
    if (!template)
      throw new NotFoundException(
        `No se encontró la plantilla con código '${code}'. Verifique que el código sea correcto.`,
      );
    return template;
  }

  async update(
    id: string,
    updateInput: UpdateTemplateInput,
  ): Promise<Template> {
    const template = await this.templateRepository.preload(updateInput);
    if (!template)
      throw new NotFoundException(
        `No se encontró la plantilla con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<Template> {
    const template = await this.templateRepository.findOneBy({ id });
    if (!template)
      throw new NotFoundException(
        `No se encontró la plantilla con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return this.templateRepository.remove(template);
  }
}
