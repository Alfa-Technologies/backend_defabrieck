import { IsUUID } from 'class-validator';
import { CreateVisualAidItemInput } from './create-visual-aid-item.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateVisualAidItemInput extends PartialType(
  CreateVisualAidItemInput,
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
