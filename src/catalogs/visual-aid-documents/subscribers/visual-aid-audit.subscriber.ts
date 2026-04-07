import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { VisualAidLog } from '../../../operations/projects/entities/visual-aid-log.entity';

const AUDITABLE_ENTITIES = ['VisualAidDocument', 'VisualAidItem'];

@Injectable()
@EventSubscriber()
export class VisualAidAuditSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  private getVisualAidId(entity: any, entityName: string): string {
    if (entityName === 'VisualAidDocument') return entity.id;
    return entity.visualAidDocumentId;
  }

  async afterInsert(event: InsertEvent<any>) {
    const entityName = event.metadata.targetName;
    if (!AUDITABLE_ENTITIES.includes(entityName)) return;

    const userId = event.queryRunner.data?.userId;
    if (!userId) return;

    const logRepository = event.manager.getRepository(VisualAidLog);
    const visualAidId = this.getVisualAidId(event.entity, entityName);

    const logCount = await logRepository.count({ where: { visualAidId } });

    await logRepository.save({
      visualAidId,
      version: logCount + 1,
      actionType: 'CREATE',
      newData: event.entity,
      modifiedById: userId,
    });
  }

  async afterUpdate(event: UpdateEvent<any>) {
    const entityName = event.metadata.targetName;
    if (!AUDITABLE_ENTITIES.includes(entityName)) return;

    const oldData = event.databaseEntity;
    const newData = event.entity;

    if (!newData) return;

    const userId = event.queryRunner.data?.userId;
    if (!userId) return;

    const logRepository = event.manager.getRepository(VisualAidLog);
    const visualAidId = this.getVisualAidId(oldData, entityName);

    let actionType = 'UPDATE_CONTENT';

    if (oldData.isActive !== undefined && newData.isActive !== undefined) {
      if (oldData.isActive === true && newData.isActive === false)
        actionType = 'DESACTIVATE';
      else if (oldData.isActive === false && newData.isActive === true)
        actionType = 'ACTIVATE';
    }

    if (entityName === 'VisualAidItem' && actionType === 'UPDATE_CONTENT') {
      if (
        oldData.imageOkUrl !== newData.imageOkUrl ||
        oldData.imageNokUrl !== newData.imageNokUrl
      ) {
        actionType = 'UPDATE_IMAGE';
      }
    }

    if (entityName === 'VisualAidDocument' && actionType === 'UPDATE_CONTENT') {
      if (!oldData.customerSignedAt && newData.customerSignedAt) {
        actionType = 'CUSTOMER_SIGNED';
      } else if (
        !oldData.finalCustomerSignedAt &&
        newData.finalCustomerSignedAt
      ) {
        actionType = 'FINAL_CUSTOMER_SIGNED';
      } else if (!oldData.internalSignedAt && newData.internalSignedAt) {
        actionType = 'INTERNAL_SIGNED';
      } else if (oldData.status !== newData.status) {
        if (newData.status === 'APPROVED' || newData.status === 'ACTIVE')
          actionType = 'APPROVE';
        if (newData.status === 'REJECTED') actionType = 'REJECT';
      }
    }

    const logCount = await logRepository.count({ where: { visualAidId } });

    await logRepository.save({
      visualAidId,
      version: logCount + 1,
      actionType,
      oldData: oldData,
      newData: newData,
      modifiedById: userId,
    });
  }
}
