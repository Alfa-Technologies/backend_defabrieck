import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { ContractType, ContractStatus } from '../enums/contracts.enums';

@ObjectType()
@Entity({ name: 'contracts' })
export class Contract {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('uuid', { name: 'employee_id' })
  employeeId: string;

  @Field(() => ContractType)
  @Column({ type: 'enum', enum: ContractType })
  type: ContractType;

  @Field(() => ContractStatus)
  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.VIGENTE,
  })
  status: ContractStatus;

  @Field(() => String)
  @Column('date', { name: 'start_date' })
  startDate: Date;

  @Field(() => String, { nullable: true })
  @Column('date', { name: 'end_date', nullable: true })
  endDate?: Date;

  @Field(() => String)
  @Column('text', { name: 'job_position' })
  jobPosition: string;

  @Field(() => String)
  @Column('text')
  department: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  salary: number;

  @Field(() => String)
  @Column('text', { name: 'work_days' })
  workDays: string;

  @Field(() => String)
  @Column('text', { name: 'payment_frequency' })
  paymentFrequency: string;

  @Field(() => String)
  @Column('date', { name: 'seniority_date' })
  seniorityDate: Date;

  @Field(() => String)
  @Column('text', { name: 'work_schedule' })
  workSchedule: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  notes?: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  personalDataSnapshot: any;

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: [] })
  clauses: string[];

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field(() => Boolean)
  @Column('boolean', { default: true })
  isActive: boolean;
}
