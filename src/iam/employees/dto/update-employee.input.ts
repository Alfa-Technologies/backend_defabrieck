import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEmployeeInput } from './create-employee.input';
import { UpdateBeneficiaryInput } from './update-beneficiary.input';
import {
  InputType,
  Field,
  PartialType,
  OmitType,
  ID,
} from '@nestjs/graphql';

@InputType()
export class UpdateEmployeeInput extends PartialType(
  OmitType(CreateEmployeeInput, ['beneficiaries'] as const),
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;

  @Field(() => [UpdateBeneficiaryInput], {
    nullable: true,
    description:
      'Lista de beneficiarios a actualizar. Beneficiarios con id se actualizan; sin id se crean. Los no incluidos se conservan.',
  })
  @IsArray({ message: 'Los beneficiarios deben ser una lista válida.' })
  @ArrayMaxSize(10, {
    message: 'No se pueden registrar más de $constraint1 beneficiarios.',
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateBeneficiaryInput)
  @IsOptional()
  beneficiaries?: UpdateBeneficiaryInput[];
}
