import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { User } from '../../../iam/users/entities/user.entity';

@ObjectType()
@Entity({ name: 'sys_notifications' })
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @Column('uuid', { name: 'user_id' })
  @Field(() => String)
  userId: string;

  @Field(() => String)
  @Column('text')
  title: string;

  @Field(() => String)
  @Column('text')
  message: string;

  @Field(() => String)
  @Column('varchar', { length: 20, default: 'INFO' })
  type: string;

  @Field(() => Boolean)
  @Column('bool', { default: false })
  isRead: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  metadata?: any;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
