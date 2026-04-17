import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsObject,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  TerminationReason,
  SettlementStatus,
} from '../enums/settlements.enums';

@InputType()
export class CreateSettlementInput {
  @Field(() => String)
  @IsUUID()
  employeeId: string;

  @Field(() => String)
  @IsString()
  hireDate: string;

  @Field(() => String)
  @IsString()
  terminationDate: string;

  @Field(() => TerminationReason)
  @IsEnum(TerminationReason)
  reason: TerminationReason;

  @Field(() => Int)
  @IsNumber()
  weeklyHours: number;

  @Field(() => SettlementStatus, { nullable: true })
  @IsEnum(SettlementStatus)
  @IsOptional()
  status?: SettlementStatus;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  breakdown?: any;
}
