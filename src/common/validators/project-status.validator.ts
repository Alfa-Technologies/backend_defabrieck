import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ProjectStatus } from '../../operations/constants/project-status.enum';

@ValidatorConstraint({ name: 'isValidProjectStatusTransition', async: false })
export class IsValidProjectStatusTransitionConstraint implements ValidatorConstraintInterface {
  validate(status: string, args: ValidationArguments) {
    if (!status) return true;

    if (!Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      return false;
    }

    if (status === ProjectStatus.ACTIVE) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `El estado ${args.value} no es válido o requiere un flujo de aprobación específico.`;
  }
}

export function IsValidProjectStatusTransition(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidProjectStatusTransitionConstraint,
    });
  };
}
