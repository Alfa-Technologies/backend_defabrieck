import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';
import { Company } from '../../../crm/companies/entities/company.entity';
import { QuoteStatus } from '../enums/quote.enums';

@ObjectType()
@Entity({ name: 'quotes' })
export class Quote {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Int)
  @Column('int')
  sequence: number;

  @Field(() => String)
  @Column('text', { unique: true })
  quoteNumber: string;

  @Field(() => Int)
  @Column('int', { default: 1 })
  version: number;

  @Field(() => QuoteStatus)
  @Column({
    type: 'enum',
    enum: QuoteStatus,
    default: QuoteStatus.DRAFT,
  })
  status: QuoteStatus;

  @ManyToOne(() => Company, { lazy: true, nullable: true })
  @JoinColumn({ name: 'company_id' })
  @Field(() => Company, { nullable: true })
  company?: Company;

  @Field(() => String, { nullable: true })
  @Column('uuid', { name: 'company_id', nullable: true })
  companyId?: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  serviceOfferedBy: any;

  @Field(() => GraphQLJSON)
  @Column('jsonb')
  serviceRequestedBy: any;

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: [] })
  services: any[];

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: [] })
  log: any[];

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  qualitySystemCode?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  actorName?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  internalNotes?: string;

  @Field(() => String, { nullable: true })
  @Column('timestamptz', { nullable: true })
  issuedAt?: Date;

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
