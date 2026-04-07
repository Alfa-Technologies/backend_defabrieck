import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantsService } from './plants.service';
import { PlantsResolver } from './plants.resolver';
import { Plant } from './entities/plant.entity';
import { Company } from '../companies/entities/company.entity';
import { PlantsLoader } from './plants.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Plant, Company])],
  providers: [PlantsResolver, PlantsService, PlantsLoader],
  exports: [TypeOrmModule, PlantsService, PlantsLoader],
})
export class PlantsModule {}
