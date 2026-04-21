import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quote } from './entities/quote.entity';
import { QuoteSettings } from './entities/quote-settings.entity';
import {
  CreateQuoteInput,
  UpdateQuoteInput,
  UpdateQuoteSettingsInput,
} from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger('QuotesService');

  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    @InjectRepository(QuoteSettings)
    private readonly settingsRepository: Repository<QuoteSettings>,
  ) {}

  async createQuote(createQuoteInput: CreateQuoteInput): Promise<Quote> {
    try {
      const newQuote = this.quotesRepository.create(createQuoteInput);
      return await this.quotesRepository.save(newQuote);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAllQuotes(paginationArgs: PaginationArgs): Promise<Quote[]> {
    const { limit, offset } = paginationArgs;
    return this.quotesRepository.find({
      take: limit,
      skip: offset,
      order: {
        sequence: 'DESC',
      },
    });
  }

  async findQuoteById(id: string): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({
      where: { id },
    });

    if (!quote) {
      throw new NotFoundException(`No se encontró la cotización con ID: ${id}`);
    }

    return quote;
  }

  async updateQuote(
    id: string,
    updateQuoteInput: UpdateQuoteInput,
  ): Promise<Quote> {
    const { id: _, ...rest } = updateQuoteInput;

    const quote = await this.quotesRepository.preload({
      id,
      ...rest,
    });

    if (!quote) {
      throw new NotFoundException(`No se encontró la cotización con ID: ${id}`);
    }

    if (!updateQuoteInput.version) {
      quote.version += 1;
    }

    try {
      return await this.quotesRepository.save(quote);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async changeStatus(id: string, isActive: boolean): Promise<Quote> {
    const quote = await this.findQuoteById(id);
    quote.isActive = isActive;

    try {
      return await this.quotesRepository.save(quote);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async getSettings(): Promise<QuoteSettings> {
    const settings = await this.settingsRepository.find();

    if (settings.length === 0) {
      const defaultSettings = this.settingsRepository.create();
      return await this.settingsRepository.save(defaultSettings);
    }

    return settings[0];
  }

  async updateSettings(
    updateSettingsInput: UpdateQuoteSettingsInput,
  ): Promise<QuoteSettings> {
    const { id, ...rest } = updateSettingsInput;

    const settings = await this.settingsRepository.preload({
      id,
      ...rest,
    });

    if (!settings) {
      throw new NotFoundException('No se encontró la configuración global.');
    }

    try {
      return await this.settingsRepository.save(settings);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException(
        `Ya existe una cotización con ese número o identificador.`,
      );
    }
    if (error.code === '23503') {
      throw new BadRequestException(
        `La empresa vinculada a esta cotización no existe.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado al gestionar cotizaciones. Contacte al administrador.',
    );
  }
}
