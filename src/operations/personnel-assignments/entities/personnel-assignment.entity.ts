import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Employee } from '../../../iam/employees/entities/employee.entity';
import { Plant } from '../../../crm/plants/entities/plant.entity';
import { Shift } from '../../shifts/entities/shift.entity';

@ObjectType()
@Entity({ name: 'personnel_assignments' })
export class PersonnelAssignment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { lazy: true })
  @JoinColumn({ name: 'employee_id' })
  @Field(() => Employee)
  employee: Employee;

  @Column('uuid', { name: 'employee_id' })
  @Field(() => String)
  employeeId: string;

  @ManyToOne(() => Plant, { lazy: true })
  @JoinColumn({ name: 'plant_id' })
  @Field(() => Plant)
  plant: Plant;

  @Column('uuid', { name: 'plant_id' })
  @Field(() => String)
  plantId: string;

  @ManyToOne(() => Shift, { lazy: true })
  @JoinColumn({ name: 'shift_id' })
  @Field(() => Shift)
  shift: Shift;

  @Column('uuid', { name: 'shift_id' })
  @Field(() => String)
  shiftId: string;

  @Field(() => String)
  @Column('date')
  startDate: string;

  @Field(() => String)
  @Column('date')
  endDate: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
