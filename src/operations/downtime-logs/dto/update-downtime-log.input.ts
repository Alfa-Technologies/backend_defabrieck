import { CreateDowntimeLogInput } from './create-downtime-log.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID, IsDate, IsOptional } from 'class-validator';

@InputType()
export class UpdateDowntimeLogInput extends PartialType(
  CreateDowntimeLogInput,
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'La hora de fin debe ser una fecha válida.' })
  endTime?: Date;
}
