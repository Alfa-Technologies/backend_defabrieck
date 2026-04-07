import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisualAidDocumentsService } from './visual-aid-documents.service';
import { VisualAidDocumentsResolver } from './visual-aid-documents.resolver';
import { VisualAidDocument } from './entities/visual-aid-document.entity';
import { ProjectPart } from '../../operations/project-parts/entities/project-part.entity';
import { VisualAidLog } from '../../operations/projects/entities/visual-aid-log.entity';
import { VisualAidDocumentsLoader } from './visual-aid-documents.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([VisualAidDocument, ProjectPart, VisualAidLog]),
  ],
  providers: [
    VisualAidDocumentsResolver,
    VisualAidDocumentsService,
    VisualAidDocumentsLoader,
  ],
  exports: [TypeOrmModule, VisualAidDocumentsService, VisualAidDocumentsLoader],
})
export class VisualAidDocumentsModule {}
