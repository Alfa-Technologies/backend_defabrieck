import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PartCatalog } from '../../part-catalog/entities/part-catalog.entity';

@ObjectType()
@Entity({ name: 'defect_types' })
export class DefectType {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text', { unique: true })
  name: string;

  @ManyToOne(() => PartCatalog, { lazy: true })
  @JoinColumn({ name: 'part_id' })
  @Field(() => PartCatalog)
  part: PartCatalog;

  @Column('text', { name: 'part_id' })
  partId: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  description?: string;

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
