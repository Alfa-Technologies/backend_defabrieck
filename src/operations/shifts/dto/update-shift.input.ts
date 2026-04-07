import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateShiftInput } from './create-shift.input';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateShiftInput extends PartialType(CreateShiftInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  @IsNotEmpty({ message: 'El ID es obligatorio.' })
  id: string;
}
