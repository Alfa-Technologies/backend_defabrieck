import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { Project } from '../../../operations/projects/entities/project.entity';

@ObjectType()
@Entity({ name: 'project_report_configs' })
export class ProjectReportConfig {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Project, (project) => project.reportConfig, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  @Field(() => Project)
  project: Project;

  @Column('uuid', { name: 'project_id' })
  projectId: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  finalSchema: any;

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
