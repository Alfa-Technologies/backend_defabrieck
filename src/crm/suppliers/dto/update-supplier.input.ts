import { CreateSupplierInput } from './create-supplier.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateSupplierInput extends PartialType(CreateSupplierInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
