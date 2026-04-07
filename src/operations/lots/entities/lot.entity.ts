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
import { Project } from '../../../operations/projects/entities/project.entity';

@ObjectType()
@Entity({ name: 'lots' })
export class Lot {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { lazy: true })
  @JoinColumn({ name: 'project_id' })
  @Field(() => Project)
  project: Project;

  @Column('text', { name: 'project_id' })
  projectId: string;

  @Field(() => String)
  @Column('text')
  lotNumber: string;

  @Field(() => Int)
  @Column('int', { default: 0 })
  totalQuantity: number;

  @Field(() => String)
  @Column('text', { default: 'OPEN' })
  status: string;

  @Field(() => Date)
  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  receivedAt: Date;

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
