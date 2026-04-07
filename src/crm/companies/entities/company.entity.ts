import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Plant } from 'src/crm/plants/entities/plant.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PartCatalog } from '../../../catalogs/part-catalog/entities/part-catalog.entity';

@ObjectType()
@Entity({ name: 'companies' })
export class Company {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text', { unique: true })
  commercialName: string;

  @Field(() => String)
  @Column('text')
  legalName: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  taxId?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  billingAddress?: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Plant, (plant) => plant.company, { lazy: true })
  @Field(() => [Plant], { nullable: 'itemsAndList' })
  plants?: Plant[];

  @OneToMany(() => PartCatalog, (partCatalog) => partCatalog.customer, {
    lazy: true,
  })
  @Field(() => [PartCatalog], { nullable: true })
  partCatalogs?: PartCatalog[];
}
