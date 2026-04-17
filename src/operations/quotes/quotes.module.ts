import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuotesService } from './quotes.service';
import { QuotesResolver } from './quotes.resolver';
import { Quote } from './entities/quote.entity';
import { QuoteSettings } from './entities/quote-settings.entity';

@Module({
  providers: [QuotesResolver, QuotesService],
  imports: [TypeOrmModule.forFeature([Quote, QuoteSettings])],
  exports: [QuotesService],
})
export class QuotesModule {}
