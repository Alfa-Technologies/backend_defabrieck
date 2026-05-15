import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@ObjectType()
@Entity({ name: 'employee_beneficiaries' })
export class Beneficiary {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Nombre completo del beneficiario' })
  @Column('text')
  fullName: string;

  @Field(() => String, { description: 'Parentesco con el empleado' })
  @Column('text')
  relationship: string;

  @Field(() => String, {
    nullable: true,
    description: 'Teléfono de contacto del beneficiario',
  })
  @Column('varchar', { length: 20, nullable: true })
  contactPhone?: string;

  @Field(() => Float, {
    description: 'Porcentaje asignado al beneficiario (0-100)',
  })
  @Column('decimal', { precision: 5, scale: 2 })
  percentage: number;

  @ManyToOne(() => Employee, (employee) => employee.beneficiaries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  @Field(() => Employee)
  employee: Employee;

  @Column({ name: 'employee_id' })
  @Field(() => String)
  employeeId: string;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
