import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProjectLog } from '../entities/project-log.entity';

const AUDITABLE_ENTITIES = [
  'Project',
  'Shift',
  'ProjectPart',
  'ProjectReportConfig',
  'ProjectProcessFlow',
];

@Injectable()
@EventSubscriber()
export class ProjectAuditSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  private getProjectId(entity: any, entityName: string): string {
    if (entityName === 'Project') return entity.id;
    return entity.projectId;
  }

  async afterInsert(event: InsertEvent<any>) {
    const entityName = event.metadata.targetName;
    if (!AUDITABLE_ENTITIES.includes(entityName)) return;

    const userId = event.queryRunner.data?.userId;
    if (!userId) return;

    const logRepository = event.manager.getRepository(ProjectLog);
    const projectId = this.getProjectId(event.entity, entityName);

    await logRepository.save({
      projectId,
      entityName,
      entityId: event.entity.id,
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

    const logRepository = event.manager.getRepository(ProjectLog);
    const projectId = this.getProjectId(oldData, entityName);

    let actionType = 'UPDATE';

    if (oldData.isActive !== undefined && newData.isActive !== undefined) {
      if (oldData.isActive === true && newData.isActive === false)
        actionType = 'DESACTIVATE';
      else if (oldData.isActive === false && newData.isActive === true)
        actionType = 'ACTIVATE';
    }

    if (!oldData.customerSignedAt && newData.customerSignedAt) {
      actionType = 'CUSTOMER_SIGNED';
    } else if (
      !oldData.finalCustomerSignedAt &&
      newData.finalCustomerSignedAt
    ) {
      actionType = 'FINAL_CUSTOMER_SIGNED';
    } else if (!oldData.internalSignedAt && newData.internalSignedAt) {
      actionType = 'INTERNAL_SIGNED';
    }

    if (oldData.status !== 'ACTIVE' && newData.status === 'ACTIVE') {
      actionType = 'PROJECT_ACTIVATED';
    }

    await logRepository.save({
      projectId,
      entityName,
      entityId: oldData.id,
      actionType: actionType,
      oldData: oldData,
      newData: newData,
      modifiedById: userId,
    });
  }
}
