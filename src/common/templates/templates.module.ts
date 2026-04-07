import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesService } from './templates.service';
import { TemplatesResolver } from './templates.resolver';
import { Template } from './entities/template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template])],
  providers: [TemplatesResolver, TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
