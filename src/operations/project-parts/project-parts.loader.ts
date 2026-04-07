import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { PartCatalog } from '../../catalogs/part-catalog/entities/part-catalog.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class ProjectPartsLoader {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(PartCatalog)
    private readonly partCatalogRepository: Repository<PartCatalog>,
  ) {}

  public readonly batchProjects = new DataLoader<string, Project | null>(
    async (projectIds: readonly string[]) => {
      const projects = await this.projectRepository.find({
        where: { id: In([...projectIds]) },
      });

      const projectMap = new Map(
        projects.map((project) => [project.id, project]),
      );
      return projectIds.map((id) => projectMap.get(id) || null);
    },
  );

  public readonly batchPartCatalogs = new DataLoader<
    string,
    PartCatalog | null
  >(async (partCatalogIds: readonly string[]) => {
    const partCatalogs = await this.partCatalogRepository.find({
      where: { id: In([...partCatalogIds]) },
    });

    const partCatalogMap = new Map(
      partCatalogs.map((catalog) => [catalog.id, catalog]),
    );
    return partCatalogIds.map((id) => partCatalogMap.get(id) || null);
  });
}
