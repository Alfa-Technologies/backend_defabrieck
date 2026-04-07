import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ProjectStatus } from '../../operations/constants/project-status.enum';

@Injectable()
export class ProjectStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);

    const args = ctx.getArgs();

    const user = ctx.getContext().req?.user;

    const input = args.updateInput || args.updateProjectInput;

    if (input) {
      return this.validateProjectStatusUpdate(input);
    }

    return true;
  }

  private validateProjectStatusUpdate(updateInput: any): boolean {
    const { status, activeRejectionReason, id } = updateInput;

    if (!status) return true;

    if (status === ProjectStatus.ACTIVE) {
      throw new BadRequestException(
        'No se puede activar un proyecto directamente. Use el flujo de aprobación con firmas digitales.',
      );
    }

    if (
      (status === ProjectStatus.CANCELLED ||
        status === ProjectStatus.ON_HOLD) &&
      !activeRejectionReason
    ) {
      throw new BadRequestException(
        `El estado ${status} requiere un motivo claro en activeRejectionReason.`,
      );
    }

    const forbiddenTransitions = [
      ProjectStatus.COMPLETED,
      ProjectStatus.CANCELLED,
      ProjectStatus.ON_HOLD,
    ];

    if (forbiddenTransitions.includes(status)) {
      throw new BadRequestException(
        `El estado ${status} requiere un flujo de aprobación específico.`,
      );
    }

    return true;
  }
}
