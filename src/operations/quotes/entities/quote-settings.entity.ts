import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity({ name: 'quote_settings' })
export class QuoteSettings {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  defaultActorName?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  defaultQualitySystemCode?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  logoDataUrl?: string;

  @Field(() => String)
  @Column('text', { default: 'QT' })
  quotePrefix: string;

  @Field(() => String)
  @Column('text', { default: '#455f87' })
  accentColor: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  serviceDefaults?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  serviceOfferedBy?: any;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
