import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { ContractType, ContractStatus } from '../enums/contracts.enums';

@InputType()
export class CreateContractInput {
  @Field(() => String)
  @IsUUID()
  employeeId: string;

  @Field(() => ContractType)
  @IsEnum(ContractType)
  type: ContractType;

  @Field(() => ContractStatus, { nullable: true })
  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @Field(() => String)
  @IsString()
  startDate: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  endDate?: string;

  @Field(() => String)
  @IsString()
  jobPosition: string;

  @Field(() => String)
  @IsString()
  department: string;

  @Field(() => Float)
  @IsNumber()
  salary: number;

  @Field(() => String)
  @IsString()
  workDays: string;

  @Field(() => String)
  @IsString()
  paymentFrequency: string;

  @Field(() => String)
  @IsString()
  seniorityDate: string;

  @Field(() => String)
  @IsString()
  workSchedule: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => GraphQLJSON)
  @IsObject()
  personalDataSnapshot: any;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  clauses: string[];
}
