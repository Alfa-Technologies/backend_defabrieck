import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { Project } from '../projects/entities/project.entity';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class ShiftsLoader {
  constructor(
    @InjectRepository(Plant)
    private readonly plantRepository: Repository<Plant>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  public readonly batchPlants = new DataLoader<string, Plant | null>(
    async (plantIds: readonly string[]) => {
      const plants = await this.plantRepository.find({
        where: { id: In([...plantIds]) },
      });
      const map = new Map(plants.map((p) => [p.id, p]));
      return plantIds.map((id) => map.get(id) || null);
    },
  );

  public readonly batchProjects = new DataLoader<string, Project | null>(
    async (projectIds: readonly string[]) => {
      const projects = await this.projectRepository.find({
        where: { id: In([...projectIds]) },
      });
      const map = new Map(projects.map((p) => [p.id, p]));
      return projectIds.map((id) => map.get(id) || null);
    },
  );
}
