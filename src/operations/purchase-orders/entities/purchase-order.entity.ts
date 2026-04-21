import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
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

import { POStatus } from '../enums/purchase-order.enums';
import { Company } from '../../../crm/companies/entities/company.entity';

@ObjectType()
export class LinkedQuoteType {
  @Field(() => String) quoteId: string;
  @Field(() => String, { nullable: true }) quoteNumber?: string;
  @Field(() => Float) amount: number;
}

@ObjectType()
export class LinkedInvoiceType {
  @Field(() => String) invoiceId: string;
  @Field(() => String, { nullable: true }) invoiceFolio?: string;
  @Field(() => Float) amount: number;
}

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

  @Field(() => String)
  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, { eager: true, nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

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

  @Field(() => [LinkedQuoteType])
  @Column('jsonb', { default: [] })
  linkedQuotes: any[];

  @Field(() => [LinkedInvoiceType])
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

  @Field(() => Boolean)
  @Column('boolean', { default: true })
  isActive: boolean;
}
