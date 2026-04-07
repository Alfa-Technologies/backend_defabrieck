import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class LotsLoader {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  public readonly batchProjects = new DataLoader<string, Project | null>(
    async (projectIds: readonly string[]) => {
      const projects = await this.projectRepository.find({
        where: { id: In([...projectIds]) },
      });

      const projectMap = new Map(projects.map((project) => [project.id, project]));
      return projectIds.map((id) => projectMap.get(id) || null);
    },
  );
}
