import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Employee } from '../../../iam/employees/entities/employee.entity';
import { DowntimeReason } from '../../../catalogs/downtime-reasons/entities/downtime-reason.entity';

@ObjectType()
@Entity({ name: 'downtime_logs' })
export class DowntimeLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  @Field(() => Project)
  project: Project;

  @Column('uuid', { name: 'project_id' })
  @Field(() => String)
  projectId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  @Field(() => Employee, { nullable: true })
  employee?: Employee;

  @Column('uuid', { name: 'employee_id', nullable: true })
  @Field(() => String, { nullable: true })
  employeeId?: string;

  @ManyToOne(() => DowntimeReason, { eager: true })
  @JoinColumn({ name: 'downtime_reason_id' })
  @Field(() => DowntimeReason)
  downtimeReason: DowntimeReason;

  @Column('uuid', { name: 'downtime_reason_id' })
  @Field(() => String)
  downtimeReasonId: string;

  @Field(() => Date)
  @Column('timestamp')
  startTime: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp', { nullable: true })
  endTime?: Date;

  @Field(() => Int, {
    nullable: true,
    description: 'Duración en minutos calculada automáticamente',
  })
  @Column('int', { nullable: true })
  minutes?: number;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  comments?: string;

  @Field(() => Boolean)
  @Column('bool', { default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
