import { CreatePlantInput } from './create-plant.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdatePlantInput extends PartialType(CreatePlantInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
