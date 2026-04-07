import { IsUUID } from 'class-validator';
import { CreateDowntimeReasonInput } from './create-downtime-reason.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateDowntimeReasonInput extends PartialType(
  CreateDowntimeReasonInput,
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
