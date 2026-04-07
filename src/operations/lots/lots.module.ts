import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotsService } from './lots.service';
import { LotsResolver } from './lots.resolver';
import { Lot } from './entities/lot.entity';
import { Project } from '../projects/entities/project.entity';
import { LotsLoader } from './lots.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Lot, Project])],
  providers: [LotsResolver, LotsService, LotsLoader],
  exports: [TypeOrmModule, LotsService, LotsLoader],
})
export class LotsModule {}
