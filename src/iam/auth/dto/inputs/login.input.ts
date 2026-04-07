import { IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';

@InputType()
export class LoginInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @Field(() => String)
  @MinLength(8, {
    message: 'La contraseña debe tener al menos $constraint1 caracteres.',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password: string;
}
