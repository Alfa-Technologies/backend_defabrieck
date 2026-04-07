import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Plant } from '../../../crm/plants/entities/plant.entity';
import { Project } from '../../projects/entities/project.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DayOfWeek } from '../../constants/day-of-week.enum';

@ObjectType()
@Entity({ name: 'shifts' })
export class Shift {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Plant, { lazy: true })
  @JoinColumn({ name: 'plant_id' })
  @Field(() => Plant)
  plant: Plant;

  @Column('uuid', { name: 'plant_id' })
  @Field(() => String)
  plantId: string;

  @ManyToOne(() => Project, { lazy: true })
  @JoinColumn({ name: 'project_id' })
  @Field(() => Project)
  project: Project;

  @Column('uuid', { name: 'project_id', nullable: true })
  @Field(() => String)
  projectId: string;

  @Field(() => String)
  @Column('text')
  name: string;

  @Field(() => String)
  @Column('time')
  startTime: string;

  @Field(() => String)
  @Column('time')
  endTime: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  workDays?: DayOfWeek[];

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
