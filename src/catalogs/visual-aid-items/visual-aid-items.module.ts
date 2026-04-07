import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisualAidItemsService } from './visual-aid-items.service';
import { VisualAidItemsResolver } from './visual-aid-items.resolver';
import { VisualAidItem } from './entities/visual-aid-item.entity';
import { DefectType } from '../defect-types/entities/defect-type.entity';
import { VisualAidDocument } from '../visual-aid-documents/entities/visual-aid-document.entity';
import { VisualAidItemsLoader } from './visual-aid-items.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([VisualAidItem, DefectType, VisualAidDocument]),
  ],
  providers: [
    VisualAidItemsResolver,
    VisualAidItemsService,
    VisualAidItemsLoader,
  ],
  exports: [TypeOrmModule, VisualAidItemsService, VisualAidItemsLoader],
})
export class VisualAidItemsModule {}
