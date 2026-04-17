import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { POStatus } from '../enums/purchase-order.enums';

@ObjectType()
@Entity({ name: 'purchase_orders' })
export class PurchaseOrder {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text', { unique: true })
  internalNumber: string;

  @Field(() => String)
  @Column('text')
  customerPoNumber: string;

  @Field(() => POStatus)
  @Column({
    type: 'enum',
    enum: POStatus,
    default: POStatus.DRAFT,
  })
  status: POStatus;

  @Field(() => String, { nullable: true })
  @Column('timestamptz', { nullable: true })
  receivedAt?: Date;

  @Field(() => String, { nullable: true })
  @Column('uuid', { name: 'company_id', nullable: true })
  companyId?: string;

  @Field(() => String, { nullable: true })
  @Column('uuid', { name: 'contact_id', nullable: true })
  contactId?: string;

  @Field(() => Float)
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  clientAmount: number;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  currency?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  ownerName?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  internalNotes?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  pdfUrl?: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: [] })
  linkedQuotes: any[];

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: [] })
  linkedInvoices: any[];

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: [] })
  log: any[];

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
