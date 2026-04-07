import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity({ name: 'employees' })
export class Employee {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text')
  firstName: string;

  @Field(() => String)
  @Column('text')
  lastName: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  phoneNumber?: string;

  @OneToOne(() => User, { nullable: true, lazy: true })
  @JoinColumn({ name: 'user_id' })
  @Field(() => User, { nullable: true })
  user?: User;

  @Column('uuid', { name: 'user_id', nullable: true })
  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String)
  @Column('text', { unique: true })
  employeeCode: string;

  @Field(() => String)
  @Column('text')
  position: string;

  @Field(() => String)
  @Column('text')
  department: string;

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
