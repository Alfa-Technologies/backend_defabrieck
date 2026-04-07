import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

// Relaciones
import { User } from '../../../iam/users/entities/user.entity';
import { VisualAidDocument } from '../../../catalogs/visual-aid-documents/entities/visual-aid-document.entity';

@ObjectType()
@Entity({ name: 'visual_aid_logs' })
export class VisualAidLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VisualAidDocument, (visualAid) => visualAid.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'visual_aid_id' })
  @Field(() => VisualAidDocument)
  visualAid: VisualAidDocument;

  @Column('uuid', { name: 'visual_aid_id' })
  @Field(() => String)
  visualAidId: string;

  @Field(() => Int)
  @Column('int')
  version: number;

  @Field(() => String, {
    description: 'CREATE, UPDATE_CONTENT, UPDATE_IMAGE, APPROVE, REJECT',
  })
  @Column('varchar', { length: 20 })
  actionType: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  oldData: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  newData: any;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  reason?: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'modified_by' })
  @Field(() => User)
  modifiedBy: User;

  @Column('uuid', { name: 'modified_by' })
  @Field(() => String)
  modifiedById: string;

  @Field(() => Date)
  @CreateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;
}
