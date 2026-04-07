import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

// Relaciones
import { Employee } from '../../../iam/employees/entities/employee.entity';
import { Plant } from '../../../crm/plants/entities/plant.entity';
import { User } from '../../../iam/users/entities/user.entity';

@ObjectType()
@Entity({ name: 'attendance_logs' })
export class AttendanceLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  @Field(() => Employee)
  employee: Employee;

  @Column('uuid', { name: 'employee_id' })
  @Field(() => String)
  employeeId: string;

  @ManyToOne(() => Plant, { eager: true })
  @JoinColumn({ name: 'plant_id' })
  @Field(() => Plant)
  plant: Plant;

  @Column('uuid', { name: 'plant_id' })
  @Field(() => String)
  plantId: string;

  @Field(() => String, { description: 'CHECK_IN or CHECK_OUT' })
  @Column('varchar', { length: 20 })
  type: string;

  @Field(() => String, { description: 'GPS, MANUAL' })
  @Column('varchar', { length: 20, default: 'MANUAL' })
  method: string;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  @Field(() => User, { nullable: true })
  createdBy?: User;

  @Column('uuid', { name: 'created_by', nullable: true })
  @Field(() => String, { nullable: true })
  createdById?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
