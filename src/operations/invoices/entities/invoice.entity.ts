import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { InvoiceStatus } from '../enums/invoice.enums';

@ObjectType()
@Entity({ name: 'invoices' })
export class Invoice {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text', { unique: true })
  internalFolio: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true, unique: true })
  satFolio?: string;

  @Field(() => InvoiceStatus)
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Field(() => String)
  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Field(() => String, { nullable: true })
  @Column('uuid', { name: 'contact_id', nullable: true })
  contactId?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  paymentConditions?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  ownerName?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  internalNotes?: string;

  @Field(() => String)
  @Column('text', { default: 'MXN' })
  currency: string;

  @Field(() => String, { nullable: true })
  @Column('timestamptz', { nullable: true })
  issueDate?: Date;

  @Field(() => String, { nullable: true })
  @Column('timestamptz', { nullable: true })
  dueDate?: Date;

  @Field(() => Float)
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Field(() => Float)
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Field(() => Float)
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: [] })
  concepts: any[];

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  cfdiUse?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  paymentMethod?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  paymentForm?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  xmlUrl?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  pdfUrl?: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: [] })
  linkedPurchaseOrders: any[];

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
