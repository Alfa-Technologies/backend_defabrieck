import { IsUUID, IsOptional, IsString } from 'class-validator';
import { CreateProjectInput } from './create-project.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { ProjectStatus } from '../../constants/project-status.enum';
import { IsValidProjectStatusTransition } from '../../../common/validators/project-status.validator';

@InputType()
export class UpdateProjectInput extends PartialType(CreateProjectInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: 'El estado debe ser un texto válido.' })
  @IsOptional()
  @IsValidProjectStatusTransition({
    message:
      'La transición de estado requiere el flujo de aprobación correspondiente',
  })
  status?: ProjectStatus;

  @Field(() => String, { nullable: true })
  @IsString({ message: 'La razón de rechazo activo debe ser un texto válido.' })
  @IsOptional()
  activeRejectionReason?: string;
}
