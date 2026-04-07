import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json'; // npm i graphql-type-json

import { Project } from '../../projects/entities/project.entity';
import { Employee } from '../../../iam/employees/entities/employee.entity';
import { User } from '../../../iam/users/entities/user.entity';

@ObjectType()
@Entity({ name: 'quality_audits' })
export class QualityAudit {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { eager: true })
  @JoinColumn({ name: 'project_id' })
  @Field(() => Project)
  project: Project;

  @Column('uuid', { name: 'project_id' })
  @Field(() => String)
  projectId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'auditor_id' })
  @Field(() => User)
  auditor: User;

  @Column('uuid', { name: 'auditor_id' })
  @Field(() => String)
  auditorId: string;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'target_employee_id' })
  @Field(() => Employee)
  targetEmployee: Employee;

  @Column('uuid', { name: 'target_employee_id' })
  @Field(() => String)
  targetEmployeeId: string;

  @Field(() => Int)
  @Column('int', { default: 0 })
  score: number;

  @Field(() => String)
  @Column('varchar', { length: 20 })
  status: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  checklistBody: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  evidencePhotos?: any;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  comments?: string;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
