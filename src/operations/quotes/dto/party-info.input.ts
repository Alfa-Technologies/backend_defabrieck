import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail } from 'class-validator';

@InputType()
export class PartyInfoInput {
  @Field(() => String)
  @IsString()
  companyName: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  contactName?: string;

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
