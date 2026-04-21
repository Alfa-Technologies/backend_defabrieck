import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';

import { QuotesService } from './quotes.service';
import { Quote } from './entities/quote.entity';
import { QuoteSettings } from './entities/quote-settings.entity';
import {
  CreateQuoteInput,
  UpdateQuoteInput,
  UpdateQuoteSettingsInput,
} from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Resolver(() => Quote)
export class QuotesResolver {
  constructor(private readonly quotesService: QuotesService) {}

  @Mutation(() => Quote, { name: 'createQuote' })
  @UseGuards(JwtAuthGuard)
  createQuote(
    @Args('createQuoteInput') createQuoteInput: CreateQuoteInput,
  ): Promise<Quote> {
    return this.quotesService.createQuote(createQuoteInput);
  }

  @Query(() => [Quote], { name: 'quotes' })
  findAllQuotes(@Args() paginationArgs: PaginationArgs): Promise<Quote[]> {
    return this.quotesService.findAllQuotes(paginationArgs);
  }

  @Query(() => Quote, { name: 'quote' })
  findQuoteById(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Quote> {
    return this.quotesService.findQuoteById(id);
  }

  @Mutation(() => Quote, { name: 'updateQuote' })
  @UseGuards(JwtAuthGuard)
  updateQuote(
    @Args('updateQuoteInput') updateQuoteInput: UpdateQuoteInput,
  ): Promise<Quote> {
    return this.quotesService.updateQuote(
      updateQuoteInput.id,
      updateQuoteInput,
    );
  }

  @Mutation(() => Quote, { name: 'changeQuoteStatus' })
  @UseGuards(JwtAuthGuard)
  changeQuoteStatus(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
  ): Promise<Quote> {
    return this.quotesService.changeStatus(id, isActive);
  }

  @Query(() => QuoteSettings, { name: 'quoteSettings' })
  getQuoteSettings(): Promise<QuoteSettings> {
    return this.quotesService.getSettings();
  }

  @Mutation(() => QuoteSettings, { name: 'updateQuoteSettings' })
  @UseGuards(JwtAuthGuard)
  updateQuoteSettings(
    @Args('updateQuoteSettingsInput')
    updateQuoteSettingsInput: UpdateQuoteSettingsInput,
  ): Promise<QuoteSettings> {
    return this.quotesService.updateSettings(updateQuoteSettingsInput);
  }
}
