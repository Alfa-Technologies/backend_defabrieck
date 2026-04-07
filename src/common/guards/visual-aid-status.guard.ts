import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { VisualAidStatus } from '../../catalogs/visual-aid-documents/constants/visual-aid-status.enum';

@Injectable()
export class VisualAidStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const args = context.getArgs()[0];

    if (args.updateInput) {
      return this.validateVisualAidStatusUpdate(args.updateInput);
    }

    return true;
  }

  private validateVisualAidStatusUpdate(updateInput: any): boolean {
    const { status, activeRejectionReason, id } = updateInput;

    if (!status) return true;

    if (status === VisualAidStatus.REJECTED && !activeRejectionReason) {
      throw new BadRequestException(
        'El rechazo de una ayuda visual requiere un motivo claro en activeRejectionReason.',
      );
    }

    const invalidTransitions: { [key: string]: VisualAidStatus[] } = {
      [VisualAidStatus.DRAFT]: [VisualAidStatus.INACTIVE],
      [VisualAidStatus.PENDING_APPROVAL]: [VisualAidStatus.DRAFT],
      [VisualAidStatus.APPROVED]: [
        VisualAidStatus.DRAFT,
        VisualAidStatus.PENDING_APPROVAL,
      ],
      [VisualAidStatus.ACTIVE]: [
        VisualAidStatus.DRAFT,
        VisualAidStatus.PENDING_APPROVAL,
      ],
      [VisualAidStatus.REJECTED]: [
        VisualAidStatus.ACTIVE,
        VisualAidStatus.APPROVED,
      ],
      [VisualAidStatus.INACTIVE]: [VisualAidStatus.PENDING_APPROVAL],
    };

    if (invalidTransitions[status]) {
      throw new BadRequestException(
        `Transición al estado ${status} no permitida. Use el flujo de aprobación correspondiente.`,
      );
    }

    return true;
  }
}
