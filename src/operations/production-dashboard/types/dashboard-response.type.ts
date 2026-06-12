import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { DashboardMetrics } from './dashboard-metrics.type';
import { DefectAnalysis } from './defect-analysis.type';

@ObjectType()
export class AttendanceRecord {
  @Field()
  date: string;

  @Field()
  checkIn: string;

  @Field({ nullable: true })
  checkOut?: string;

  @Field()
  inspectorId: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  hoursWorked?: number;

  @Field({ nullable: true })
  inspectorName?: string;
}

@ObjectType()
export class DashboardResponse {
  @Field(() => DashboardMetrics)
  metrics: DashboardMetrics;

  @Field(() => [DefectAnalysis])
  topDefects: DefectAnalysis[];

  @Field(() => Int)
  activeInspectors: number;

  @Field(() => Float)
  totalHoursWorked: number;

  @Field(() => Int, { nullable: true })
  quotedPieces?: number;

  @Field(() => Int, { nullable: true })
  remainingPieces?: number;

  @Field(() => Float, { nullable: true })
  quotedRate?: number;

  @Field(() => String, { nullable: true })
  quoteNumber?: string;

  @Field(() => [AttendanceRecord], { nullable: true })
  attendanceRecords?: AttendanceRecord[];
}
