import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Company } from '../../../crm/companies/entities/company.entity';
import { DefectType } from '../../defect-types/entities/defect-type.entity';
import { ProjectPart } from '../../../operations/project-parts/entities/project-part.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'part_catalog' })
export class PartCatalog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text')
  partNumber: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  description?: string;

  @ManyToOne(() => Company, { lazy: true })
  @JoinColumn({ name: 'customer_id' })
  @Field(() => Company)
  customer: Company;

  @Column('text', { name: 'customer_id' })
  customerId: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => DefectType, (defect) => defect.part, { lazy: true })
  @Field(() => [DefectType])
  defectTypes: DefectType[];

  @OneToMany(() => ProjectPart, (projectPart) => projectPart.partCatalog, {
    lazy: true,
  })
  @Field(() => [ProjectPart])
  projectParts: ProjectPart[];

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
