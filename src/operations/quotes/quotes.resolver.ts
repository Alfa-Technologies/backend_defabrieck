import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';

import { QuotesService } from './quotes.service';
import { Quote } from './entities/quote.entity';
import { QuoteSettings } from './entities/quote-settings.entity';
import {
  CreateQuoteInput,
  UpdateQuoteInput,
  UpdateQuoteSettingsInput,
} from './dto';

@Resolver(() => Quote)
export class QuotesResolver {
  constructor(private readonly quotesService: QuotesService) {}

  @Mutation(() => Quote, { name: 'createQuote' })
  createQuote(
    @Args('createQuoteInput') createQuoteInput: CreateQuoteInput,
  ): Promise<Quote> {
    return this.quotesService.createQuote(createQuoteInput);
  }

  @Query(() => [Quote], { name: 'quotes' })
  findAllQuotes(): Promise<Quote[]> {
    return this.quotesService.findAllQuotes();
  }

  @Query(() => Quote, { name: 'quote' })
  findQuoteById(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Quote> {
    return this.quotesService.findQuoteById(id);
  }

  @Mutation(() => Quote, { name: 'updateQuote' })
  updateQuote(
    @Args('updateQuoteInput') updateQuoteInput: UpdateQuoteInput,
  ): Promise<Quote> {
    return this.quotesService.updateQuote(
      updateQuoteInput.id,
      updateQuoteInput,
    );
  }

  @Mutation(() => Boolean, { name: 'removeQuote' })
  removeQuote(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    return this.quotesService.removeQuote(id);
  }

  @Query(() => QuoteSettings, { name: 'quoteSettings' })
  getQuoteSettings(): Promise<QuoteSettings> {
    return this.quotesService.getSettings();
  }

  @Mutation(() => QuoteSettings, { name: 'updateQuoteSettings' })
  updateQuoteSettings(
    @Args('updateQuoteSettingsInput')
    updateQuoteSettingsInput: UpdateQuoteSettingsInput,
  ): Promise<QuoteSettings> {
    return this.quotesService.updateSettings(updateQuoteSettingsInput);
  }
}
