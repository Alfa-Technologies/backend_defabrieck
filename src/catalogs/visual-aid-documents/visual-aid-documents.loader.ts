import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProjectPart } from '../../operations/project-parts/entities/project-part.entity';
import { VisualAidLog } from '../../operations/projects/entities/visual-aid-log.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class VisualAidDocumentsLoader {
  constructor(
    @InjectRepository(ProjectPart)
    private readonly projectPartRepository: Repository<ProjectPart>,
    @InjectRepository(VisualAidLog)
    private readonly visualAidLogRepository: Repository<VisualAidLog>,
  ) {}

  public readonly batchProjectParts = new DataLoader<string, ProjectPart | null>(
    async (projectPartIds: readonly string[]) => {
      const projectParts = await this.projectPartRepository.find({
        where: { id: In([...projectPartIds]) },
      });

      const projectPartMap = new Map(projectParts.map((part) => [part.id, part]));
      return projectPartIds.map((id) => projectPartMap.get(id) || null);
    },
  );

  public readonly batchVisualAidLogs = new DataLoader<string, VisualAidLog[]>(
    async (visualAidDocumentIds: readonly string[]) => {
      const logs = await this.visualAidLogRepository.find({
        where: { visualAidId: In([...visualAidDocumentIds]) },
      });

      const map = new Map<string, VisualAidLog[]>();
      visualAidDocumentIds.forEach(id => map.set(id, [])); // Inicializar vacíos
      logs.forEach(log => map.get(log.visualAidId)?.push(log));
      
      return visualAidDocumentIds.map(id => map.get(id) || []);
    },
  );
}
