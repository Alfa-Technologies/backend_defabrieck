import { IsUUID } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  @Field(() => ID)
  id: string;
}
