import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import {
  TerminationReason,
  SettlementStatus,
} from '../enums/settlements.enums';

@ObjectType()
@Entity({ name: 'settlements' })
export class Settlement {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('uuid', { name: 'employee_id' })
  employeeId: string;

  @Field(() => String)
  @Column('date', { name: 'hire_date' })
  hireDate: Date;

  @Field(() => String)
  @Column('date', { name: 'termination_date' })
  terminationDate: Date;

  @Field(() => TerminationReason)
  @Column({ type: 'enum', enum: TerminationReason })
  reason: TerminationReason;

  @Field(() => Int)
  @Column('int', { name: 'weekly_hours' })
  weeklyHours: number;

  @Field(() => SettlementStatus)
  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.DRAFT,
  })
  status: SettlementStatus;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalAmount?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { default: {} })
  breakdown?: any;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
