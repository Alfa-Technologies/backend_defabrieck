import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ProjectPart } from '../../../operations/project-parts/entities/project-part.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VisualAidLog } from '../../../operations/projects/entities/visual-aid-log.entity';
import { VisualAidStatus } from '../constants/visual-aid-status.enum';

@ObjectType()
@Entity({ name: 'visual_aid_documents' })
export class VisualAidDocument {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProjectPart, { lazy: true })
  @JoinColumn({ name: 'project_part_id' })
  @Field(() => ProjectPart)
  projectPart: ProjectPart;

  @Column('uuid', { name: 'project_part_id' })
  projectPartId: string;

  @Field(() => String)
  @Column('text')
  documentCode: string;

  @Field(() => String)
  @Column('text')
  operationName: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  ppeDescription?: string;

  @Field(() => String)
  @Column('text', { default: 'A' })
  currentRevision: string;

  @Field(() => String)
  @Column('date', { default: () => 'CURRENT_DATE' })
  currentRevisionDate: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  prevRevision?: string;

  @Field(() => String, { nullable: true })
  @Column('date', { nullable: true })
  prevRevisionDate?: string;

  @Field(() => VisualAidStatus)
  @Column({
    type: 'text',
    default: VisualAidStatus.DRAFT,
  })
  status: VisualAidStatus;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  activeRejectionReason?: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  customerSignedAt?: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  finalCustomerSignedAt?: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  internalSignedAt?: Date;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  customerSignatureUrl?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  finalCustomerSignatureUrl?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  internalSignatureUrl?: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => VisualAidLog, (log) => log.visualAid, { lazy: true })
  @Field(() => [VisualAidLog], { nullable: true })
  logs?: VisualAidLog[];
}
