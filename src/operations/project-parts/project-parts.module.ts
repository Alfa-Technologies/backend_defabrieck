import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectPartsService } from './project-parts.service';
import { ProjectPartsResolver } from './project-parts.resolver';
import { ProjectPart } from './entities/project-part.entity';
import { Project } from '../projects/entities/project.entity';
import { PartCatalog } from '../../catalogs/part-catalog/entities/part-catalog.entity';
import { ProjectPartsLoader } from './project-parts.loader';
import { PartCatalogModule } from '../../catalogs/part-catalog/part-catalog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectPart, Project, PartCatalog]),
    PartCatalogModule,
  ],
  providers: [ProjectPartsResolver, ProjectPartsService, ProjectPartsLoader],
  exports: [TypeOrmModule, ProjectPartsService, ProjectPartsLoader],
})
export class ProjectPartsModule {}
