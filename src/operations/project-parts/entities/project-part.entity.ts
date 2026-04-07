import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PartCatalog } from '../../../catalogs/part-catalog/entities/part-catalog.entity';
import { Project } from '../../../operations/projects/entities/project.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'project_parts' })
export class ProjectPart {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { lazy: true })
  @JoinColumn({ name: 'project_id' })
  @Field(() => Project)
  project: Project;

  @Column('text', { name: 'project_id' })
  projectId: string;

  @ManyToOne(() => PartCatalog, { lazy: true })
  @JoinColumn({ name: 'part_catalog_id' })
  @Field(() => PartCatalog)
  partCatalog: PartCatalog;

  @Column('text', { name: 'part_catalog_id', nullable: true })
  partCatalogId: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'internal_part_number', nullable: true })
  internalPartNumber?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  description?: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
