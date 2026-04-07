import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'sys_templates' })
export class Template {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('varchar', { length: 50, unique: true })
  code: string;

  @Field(() => String)
  @Column('varchar', { length: 20 })
  type: string;

  @Field(() => String)
  @Column('text')
  title: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  subject?: string;

  @Field(() => String)
  @Column('text')
  content: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  lastUpdate: Date;
}
