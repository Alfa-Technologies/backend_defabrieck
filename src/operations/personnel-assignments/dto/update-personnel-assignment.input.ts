import { IsUUID } from 'class-validator';
import { CreatePersonnelAssignmentInput } from './create-personnel-assignment.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdatePersonnelAssignmentInput extends PartialType(
  CreatePersonnelAssignmentInput,
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
