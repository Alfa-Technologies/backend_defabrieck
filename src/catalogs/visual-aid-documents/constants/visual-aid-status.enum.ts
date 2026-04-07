import { registerEnumType } from '@nestjs/graphql';

export enum VisualAidStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

registerEnumType(VisualAidStatus, {
  name: 'VisualAidStatus',
});
