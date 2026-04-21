import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceInput, UpdateInvoiceInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger('InvoicesService');

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceInput: CreateInvoiceInput): Promise<Invoice> {
    try {
      const invoice = this.invoiceRepository.create(createInvoiceInput);
      return await this.invoiceRepository.save(invoice);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Invoice[]> {
    const { limit, offset } = paginationArgs;
    return await this.invoiceRepository.find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneBy({ id });
    if (!invoice)
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    return invoice;
  }

  async update(updateInvoiceInput: UpdateInvoiceInput): Promise<Invoice> {
    const invoice = await this.invoiceRepository.preload(updateInvoiceInput);

    if (!invoice)
      throw new NotFoundException(
        `Factura con ID ${updateInvoiceInput.id} no encontrada`,
      );

    try {
      return await this.invoiceRepository.save(invoice);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async changeStatus(id: string, isActive: boolean): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.isActive = isActive;

    try {
      return await this.invoiceRepository.save(invoice);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(
        'El folio interno o el folio SAT ya existe.',
      );
    }
    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado al gestionar la factura. Revisa los logs.',
    );
  }
}
