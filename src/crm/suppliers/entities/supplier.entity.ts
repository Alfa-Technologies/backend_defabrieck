import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'suppliers' })
export class Supplier {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text')
  name: string;

  @Field(() => String)
  @Column('text')
  email: string;

  @Field(() => String)
  @Column('text')
  phone: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  address?: string;

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
