import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@ObjectType()
@Entity({ name: 'plants' })
export class Plant {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text')
  name: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  state?: string;

  @Field(() => String)
  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.plants, { lazy: true })
  @JoinColumn({ name: 'company_id' })
  @Field(() => Company)
  company: Company;

  @Column('text', { name: 'company_id' })
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
