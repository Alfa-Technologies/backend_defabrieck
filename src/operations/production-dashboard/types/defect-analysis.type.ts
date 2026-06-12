import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DefectAnalysis {
  @Field(() => String)
  defectName: string;

  @Field(() => Int)
  count: number;
}
