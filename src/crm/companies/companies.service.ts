import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyInput, UpdateCompanyInput } from './dto';
import { Company } from './entities/company.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger('CompaniesService');

  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyInput: CreateCompanyInput): Promise<Company> {
    try {
      const newCompany = this.companiesRepository.create(createCompanyInput);
      return await this.companiesRepository.save(newCompany);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al crear la empresa. Por favor, contacte al administrador.',
      );
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Company[]> {
    const { limit, offset } = paginationArgs;

    return this.companiesRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOneBy({ id });
    if (!company) {
      throw new NotFoundException(
        `No se encontró la empresa con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }
    return company;
  }

  async update(
    id: string,
    updateCompanyInput: UpdateCompanyInput,
  ): Promise<Company> {
    const company = await this.companiesRepository.preload(updateCompanyInput);

    if (!company) {
      throw new NotFoundException(
        `No se encontró la empresa con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }

    try {
      return await this.companiesRepository.save(company);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar la empresa. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<Company> {
    const company = await this.findOne(id);
    company.isActive = isActive;
    return this.companiesRepository.save(company);
  }

  private handleDBExceptions(error: any): never {
    // Duplicado de nombre o identificador único
    if (error.code === '23505') {
      const field = error.detail?.match(/\((.*?)\)/)?.[1] || 'proporcionado';
      throw new ConflictException(
        `El dato duplicado en ${field} ya existe en otro registro.`,
      );
    }

    // Violación de clave foránea
    if (error.code === '23503') {
      throw new BadRequestException(
        `La referencia proporcionada no existe en el sistema. Verifique que todos los datos relacionados sean válidos.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
