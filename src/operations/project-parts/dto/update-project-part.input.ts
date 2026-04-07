import { IsUUID } from 'class-validator';
import { CreateProjectPartInput } from './create-project-part.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateProjectPartInput extends PartialType(
  CreateProjectPartInput,
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
