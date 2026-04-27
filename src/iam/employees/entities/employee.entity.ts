import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
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

  @Field(() => Float, {
    nullable: true,
    description: 'Salario diario del empleado',
  })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  dailySalary?: number;

  @Field(() => String, { nullable: true, description: 'CURP del empleado' })
  @Column('varchar', { length: 18, nullable: true })
  curp?: string;

  @Field(() => String, { nullable: true, description: 'RFC del empleado' })
  @Column('varchar', { length: 13, nullable: true })
  rfc?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Número de Seguro Social (IMSS)',
  })
  @Column('varchar', { length: 11, nullable: true })
  nss?: string;

  @Field(() => String, { nullable: true, description: 'Género del empleado' })
  @Column('text', { nullable: true })
  gender?: string;

  @Field(() => String, { nullable: true, description: 'Estado civil' })
  @Column('text', { nullable: true })
  maritalStatus?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Dirección del empleado',
  })
  @Column('text', { nullable: true })
  address?: string;

  @Field(() => Date, {
    nullable: true,
    description: 'Fecha de nacimiento del empleado',
  })
  @Column('date', { nullable: true })
  birthDate?: Date;
}
