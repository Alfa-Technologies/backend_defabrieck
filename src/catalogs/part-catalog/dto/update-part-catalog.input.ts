import { IsUUID } from 'class-validator';
import { CreatePartCatalogInput } from './create-part-catalog.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdatePartCatalogInput extends PartialType(
  CreatePartCatalogInput,
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
