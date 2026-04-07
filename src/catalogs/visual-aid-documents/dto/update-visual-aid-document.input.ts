import { IsUUID, IsOptional, IsString } from 'class-validator';
import { CreateVisualAidDocumentInput } from './create-visual-aid-document.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { VisualAidStatus } from '../constants/visual-aid-status.enum';

@InputType()
export class UpdateVisualAidDocumentInput extends PartialType(
  CreateVisualAidDocumentInput,
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;

  @Field(() => VisualAidStatus, { nullable: true })
  @IsOptional()
  status?: VisualAidStatus;

  @Field(() => String, { nullable: true })
  @IsString({ message: 'La razón de rechazo activo debe ser un texto válido.' })
  @IsOptional()
  activeRejectionReason?: string;
}
