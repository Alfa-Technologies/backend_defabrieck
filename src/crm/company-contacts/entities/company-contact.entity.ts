import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from 'src/iam/users/entities/user.entity';

@ObjectType()
@Entity({ name: 'company_contacts' })
export class CompanyContact {
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

  @ManyToOne(() => Company, { lazy: true })
  @JoinColumn({ name: 'company_id' })
  @Field(() => Company)
  company: Company;

  @Column('text', { name: 'company_id' })
  companyId: string;

  @Field(() => String)
  @Column('text')
  position: string;

  @Field(() => Boolean)
  @Column('bool', { default: false })
  isPrimary: boolean;

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
