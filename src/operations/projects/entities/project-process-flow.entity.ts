import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { Project } from './project.entity';
import { User } from '../../../iam/users/entities/user.entity';

@ObjectType()
@Entity({ name: 'project_process_flows' })
export class ProjectProcessFlow {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.processFlows, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  @Field(() => Project)
  project: Project;

  @Column('uuid', { name: 'project_id' })
  @Field(() => String)
  projectId: string;

  @Field(() => String)
  @Column('text')
  name: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  description?: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  flowData: any;

  @Field(() => Int)
  @Column('int', { default: 1 })
  version: number;

  @Field(() => String)
  @Column('varchar', { length: 20, default: 'DRAFT' })
  status: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isCurrent: boolean;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  @Field(() => User)
  createdBy: User;

  @Column('uuid', { name: 'created_by' })
  @Field(() => String)
  createdById: string;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
