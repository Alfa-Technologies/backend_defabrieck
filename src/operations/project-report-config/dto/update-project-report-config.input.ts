import { IsUUID } from 'class-validator';
import { CreateProjectReportConfigInput } from './create-project-report-config.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateProjectReportConfigInput extends PartialType(
  CreateProjectReportConfigInput,
) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
