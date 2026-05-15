import { IsOptional, IsUUID } from 'class-validator';
import { CreateBeneficiaryInput } from './create-beneficiary.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateBeneficiaryInput extends PartialType(
  CreateBeneficiaryInput,
) {
  @Field(() => ID, {
    nullable: true,
    description:
      'ID del beneficiario existente. Omitir para crear uno nuevo en la actualización.',
  })
  @IsUUID('4', {
    message: 'El ID del beneficiario no es un identificador válido.',
  })
  @IsOptional()
  id?: string;
}
