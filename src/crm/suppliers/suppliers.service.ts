import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierInput, UpdateSupplierInput } from './dto';
import { Supplier } from './entities/supplier.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger('SuppliersService');

  constructor(
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierInput: CreateSupplierInput): Promise<Supplier> {
    try {
      const newSupplier = this.suppliersRepository.create(createSupplierInput);
      return await this.suppliersRepository.save(newSupplier);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al crear el proveedor. Por favor, contacte al administrador.',
      );
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Supplier[]> {
    const { limit, offset } = paginationArgs;

    return this.suppliersRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOneBy({ id });
    if (!supplier) {
      throw new NotFoundException(
        `No se encontró el proveedor con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }
    return supplier;
  }

  async update(
    id: string,
    updateSupplierInput: UpdateSupplierInput,
  ): Promise<Supplier> {
    const supplier = await this.suppliersRepository.preload(updateSupplierInput);

    if (!supplier) {
      throw new NotFoundException(
        `No se encontró el proveedor con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }

    try {
      return await this.suppliersRepository.save(supplier);
    } catch (error) {
      this.handleDBExceptions(error);
      throw new BadRequestException(
        'Error inesperado al actualizar el proveedor. Por favor, contacte al administrador.',
      );
    }
  }

  async remove(id: string, isActive: boolean): Promise<Supplier> {
    const supplier = await this.findOne(id);
    supplier.isActive = isActive;
    return this.suppliersRepository.save(supplier);
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
        `La referencia proporcionada no existe en el sistema. Verifique que todos los datos relacionados sean válidos.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
