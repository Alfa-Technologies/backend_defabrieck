import { IsUUID } from 'class-validator';
import { CreateReportTypeInput } from './create-report-type.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateReportTypeInput extends PartialType(CreateReportTypeInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
