import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VisualAidDocument } from '../../visual-aid-documents/entities/visual-aid-document.entity';
import { DefectType } from '../../defect-types/entities/defect-type.entity';

@ObjectType()
@Entity({ name: 'visual_aid_items' })
export class VisualAidItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DefectType, { nullable: true, lazy: true })
  @JoinColumn({ name: 'defect_type_id' })
  @Field(() => DefectType, { nullable: true })
  defectType?: DefectType;

  @Column('uuid', { name: 'defect_type_id', nullable: true })
  @Field(() => String, { nullable: true })
  defectTypeId?: string;

  @ManyToOne(() => VisualAidDocument, { lazy: true })
  @JoinColumn({ name: 'visual_aid_document_id' })
  @Field(() => VisualAidDocument)
  visualAidDocument: VisualAidDocument;

  @Column('uuid', { name: 'visual_aid_document_id' })
  visualAidDocumentId: string;

  @Field(() => Int)
  @Column('int')
  displayOrder: number;

  @Field(() => String)
  @Column('text')
  defectName: string;

  @Field(() => String)
  @Column('text')
  what: string;

  @Field(() => String)
  @Column('text')
  how: string;

  @Field(() => String)
  @Column('text')
  why: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  imageOkUrl?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  imageNokUrl?: string;

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
