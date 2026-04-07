import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { Project } from './project.entity';
import { User } from '../../../iam/users/entities/user.entity';

@ObjectType()
@Entity({ name: 'project_logs' })
export class ProjectLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  @Field(() => Project)
  project: Project;

  @Column('uuid', { name: 'project_id' })
  @Field(() => String)
  projectId: string;

  @Field(() => String)
  @Column('varchar', { length: 50 })
  entityName: string;

  @Field(() => String)
  @Column('uuid')
  entityId: string;

  @Field(() => String)
  @Column('varchar', { length: 20 })
  actionType: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  oldData: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  newData: any;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  reason?: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'modified_by' })
  @Field(() => User)
  modifiedBy: User;

  @Column('uuid', { name: 'modified_by' })
  @Field(() => String)
  modifiedById: string;

  @Field(() => Date)
  @CreateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;
}
