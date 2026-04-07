import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DefectType } from '../defect-types/entities/defect-type.entity';
import { VisualAidDocument } from '../visual-aid-documents/entities/visual-aid-document.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class VisualAidItemsLoader {
  constructor(
    @InjectRepository(DefectType)
    private readonly defectTypeRepository: Repository<DefectType>,
    @InjectRepository(VisualAidDocument)
    private readonly visualAidDocumentRepository: Repository<VisualAidDocument>,
  ) {}

  public readonly batchDefectTypes = new DataLoader<string, DefectType | null>(
    async (defectTypeIds: readonly string[]) => {
      const defectTypes = await this.defectTypeRepository.find({
        where: { id: In([...defectTypeIds]) },
      });

      const defectTypeMap = new Map(defectTypes.map((type) => [type.id, type]));
      return defectTypeIds.map((id) => defectTypeMap.get(id) || null);
    },
  );

  public readonly batchVisualAidDocuments = new DataLoader<string, VisualAidDocument | null>(
    async (visualAidDocumentIds: readonly string[]) => {
      const documents = await this.visualAidDocumentRepository.find({
        where: { id: In([...visualAidDocumentIds]) },
      });

      const documentMap = new Map(documents.map((doc) => [doc.id, doc]));
      return visualAidDocumentIds.map((id) => documentMap.get(id) || null);
    },
  );
}
