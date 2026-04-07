import { CreateCompanyContactInput } from './create-company-contact.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateCompanyContactInput extends PartialType(
  CreateCompanyContactInput,
) {
  @Field(() => String)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
