import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DashboardMetrics {
  @Field(() => Int)
  totalInspected: number;

  @Field(() => Int)
  approved: number;

  @Field(() => Int)
  rejected: number;

  @Field(() => Int)
  reworked: number;

  @Field(() => Int)
  totalDefects: number;
}
