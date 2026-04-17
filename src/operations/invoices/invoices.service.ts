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

  async findAll(): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
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

  async remove(id: string): Promise<boolean> {
    const invoice = await this.findOne(id);
    await this.invoiceRepository.remove(invoice);
    return true;
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
