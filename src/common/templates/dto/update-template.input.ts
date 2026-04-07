import { IsUUID } from 'class-validator';
import { CreateTemplateInput } from './create-template.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateTemplateInput extends PartialType(CreateTemplateInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
