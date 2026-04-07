import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectInput, UpdateProjectInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { ShiftsService } from '../shifts/shifts.service';
import {
  DEFAULT_SHIFTS_CONFIG,
  ShiftType,
} from '../constants/shifts.constants';
import { ProjectStatus } from '../constants/project-status.enum';
import { DayOfWeek } from '../constants/day-of-week.enum';
import { User } from '../../iam/users/entities/user.entity';
import { ProjectProcessFlow } from './entities/project-process-flow.entity';
import { CreateProcessFlowInput } from './dto/create-process-flow.input';
import { VisualAidDocument } from '../../catalogs/visual-aid-documents/entities/visual-aid-document.entity';
import { VisualAidStatus } from '../../catalogs/visual-aid-documents/constants/visual-aid-status.enum';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('ProjectsService');

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly shiftsService: ShiftsService,

    @InjectRepository(ProjectProcessFlow)
    private readonly processFlowRepository: Repository<ProjectProcessFlow>,

    @InjectRepository(VisualAidDocument)
    private readonly visualAidRepo: Repository<VisualAidDocument>,
  ) {}

  async create(createInput: CreateProjectInput, user: User): Promise<Project> {
    try {
      const project = this.projectRepository.create({
        ...createInput,
        requiredShifts: createInput.requiredShifts || [],
        status: ProjectStatus.DRAFT,
        isActive: true,
      });

      return await this.projectRepository.save(project, {
        data: { userId: user.id },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Project[]> {
    const { limit, offset } = paginationArgs;

    return this.projectRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project)
      throw new NotFoundException(
        `No se encontró el proyecto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return project;
  }

  async update(
    id: string,
    updateInput: UpdateProjectInput,
    user: User,
  ): Promise<Project> {
    const currentProject = await this.projectRepository.findOne({
      where: { id },
    });

    if (!currentProject) {
      throw new NotFoundException(
        `No se encontró el proyecto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }

    if (updateInput.status) {
      this.validateStatusTransition(
        currentProject.status,
        updateInput.status,
        currentProject,
      );
    }

    const project = await this.projectRepository.preload({
      ...updateInput,
      id,
    });

    if (!project) {
      throw new NotFoundException(
        `No se encontró el proyecto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }

    return await this.projectRepository.save(project, {
      data: { userId: user.id },
    });
  }

  private validateStatusTransition(
    currentStatus: ProjectStatus,
    newStatus: ProjectStatus,
    project: Project,
  ): void {
    const allowedDirectTransitions: { [key: string]: ProjectStatus[] } = {
      [ProjectStatus.DRAFT]: [ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
      [ProjectStatus.ACTIVE]: [
        ProjectStatus.ON_HOLD,
        ProjectStatus.COMPLETED,
        ProjectStatus.CANCELLED,
      ],
      [ProjectStatus.ON_HOLD]: [ProjectStatus.DRAFT, ProjectStatus.CANCELLED],
    };

    if (newStatus === ProjectStatus.ACTIVE) {
      throw new BadRequestException(
        'No se puede activar un proyecto directamente. El proyecto debe ser firmado por el cliente y aprobado internamente.',
      );
    }

    if (
      newStatus === ProjectStatus.COMPLETED &&
      currentStatus === ProjectStatus.ACTIVE
    ) {
      this.logger.log(`Project ${project.id} marked as completed`);
    }

    if (
      allowedDirectTransitions[currentStatus] &&
      !allowedDirectTransitions[currentStatus].includes(newStatus)
    ) {
      throw new BadRequestException(
        `Transición de ${currentStatus} a ${newStatus} no permitida. Use el flujo de aprobación correspondiente.`,
      );
    }
  }

  private async handleRejectionReset(
    project: Project,
    rejectionReason: string,
    user: User,
  ): Promise<void> {
    project.customerSignedAt = undefined;
    project.customerSignatureUrl = undefined;
    project.finalCustomerSignedAt = undefined;
    project.finalCustomerSignatureUrl = undefined;
    project.internalSignedAt = undefined;
    project.internalSignatureUrl = undefined;
    project.activeRejectionReason = rejectionReason;

    if (project.status === ProjectStatus.ACTIVE) {
      project.status = ProjectStatus.DRAFT;

      await this.deactivateProjectShifts(project.id);
    }

    await this.projectRepository.save(project, {
      data: { userId: user.id },
    });

    this.logger.warn(
      `Project ${project.id} rejected and reset to DRAFT. Reason: ${rejectionReason}`,
    );
  }

  private async deactivateProjectShifts(projectId: string): Promise<void> {
    try {
      this.logger.log(`Deactivating shifts for rejected project ${projectId}`);
      // await this.shiftsService.deactivateByProject(projectId);
    } catch (error) {
      this.logger.error(
        `Failed to deactivate shifts for project ${projectId}:`,
        error,
      );
    }
  }

  async remove(id: string, isActive: boolean, user: User): Promise<Project> {
    const project = await this.findOne(id);
    project.isActive = isActive;

    return this.projectRepository.save(project, {
      data: { userId: user.id },
    });
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23503') {
      throw new BadRequestException(
        `La referencia proporcionada no existe en el sistema. Por favor, verifique que todos los datos relacionados sean válidos.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }

  async addProcessFlow(
    createInput: CreateProcessFlowInput,
    user: User,
  ): Promise<ProjectProcessFlow> {
    try {
      await this.processFlowRepository.update(
        { projectId: createInput.projectId, isCurrent: true },
        { isCurrent: false },
      );

      const lastFlow = await this.processFlowRepository.findOne({
        where: { projectId: createInput.projectId },
        order: { version: 'DESC' },
      });
      const newVersion = lastFlow ? lastFlow.version + 1 : 1;

      const newFlow = this.processFlowRepository.create({
        ...createInput,
        version: newVersion,
        status: 'ACTIVE',
        isCurrent: true,
        createdById: user.id,
      });

      return await this.processFlowRepository.save(newFlow, {
        data: { userId: user.id },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async signProjectAsCustomer(
    projectId: string,
    signatureUrl: string,
    user: User,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project)
      throw new NotFoundException(
        'No se encontró el proyecto. Verifique que el identificador sea correcto.',
      );

    const pendingVisualAidsCount = await this.visualAidRepo
      .createQueryBuilder('visualAid')
      .innerJoin('visualAid.projectPart', 'projectPart')
      .where('projectPart.projectId = :projectId', { projectId })
      .andWhere('visualAid.status NOT IN (:...statuses)', {
        statuses: [VisualAidStatus.APPROVED, VisualAidStatus.ACTIVE],
      })
      .andWhere('visualAid.isActive = :isActive', { isActive: true })
      .getCount();

    if (pendingVisualAidsCount > 0) {
      throw new BadRequestException(
        `No puedes firmar el proyecto. Faltan ${pendingVisualAidsCount} Ayuda(s) Visual(es) por aprobar.`,
      );
    }

    project.customerSignedAt = new Date();
    project.customerSignatureUrl = signatureUrl;

    return await this.projectRepository.save(project, {
      data: { userId: user.id },
    });
  }

  async signProjectAsFinalCustomer(
    projectId: string,
    signatureUrl: string,
    user: User,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project)
      throw new NotFoundException(
        'No se encontró el proyecto. Verifique que el identificador sea correcto.',
      );

    if (!project.customerSignedAt) {
      throw new BadRequestException(
        'El cliente principal debe firmar antes que el cliente final.',
      );
    }

    project.finalCustomerSignedAt = new Date();
    project.finalCustomerSignatureUrl = signatureUrl;

    return await this.projectRepository.save(project, {
      data: { userId: user.id },
    });
  }

  async signProjectAsInternal(
    projectId: string,
    signatureUrl: string,
    user: User,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project)
      throw new NotFoundException(
        'No se encontró el proyecto. Verifique que el identificador sea correcto.',
      );

    if (!project.customerSignedAt) {
      throw new BadRequestException(
        'El proyecto no puede ser activado internamente sin la firma del cliente.',
      );
    }

    project.internalSignedAt = new Date();
    project.internalSignatureUrl = signatureUrl;
    project.status = ProjectStatus.ACTIVE;

    const savedProject = await this.projectRepository.save(project, {
      data: { userId: user.id },
    });

    if (savedProject.requiredShifts) {
      await this.createShiftsForProject(savedProject, user);
    }

    return savedProject;
  }

  private async createShiftsForProject(
    project: Project,
    user: User,
  ): Promise<void> {
    const requiredShifts = project.requiredShifts;

    if (!Array.isArray(requiredShifts)) return;

    for (const shiftInput of requiredShifts) {
      const shiftKey =
        typeof shiftInput === 'string' ? shiftInput : shiftInput.type;
      const config = DEFAULT_SHIFTS_CONFIG[shiftKey];

      if (!config) continue;

      try {
        await this.shiftsService.create(
          {
            plantId: project.plantId,
            projectId: project.id,
            name: config.name,
            startTime: config.startTime,
            endTime: config.endTime,
            workDays: config.workDays || [
              DayOfWeek.MONDAY,
              DayOfWeek.TUESDAY,
              DayOfWeek.WEDNESDAY,
              DayOfWeek.THURSDAY,
              DayOfWeek.FRIDAY,
              DayOfWeek.SATURDAY,
              DayOfWeek.SUNDAY,
            ],
          },
          user,
        );

        this.logger.log(
          `Created shift ${config.name} for project ${project.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create shift ${config.name} for project ${project.id}:`,
          error,
        );
      }
    }
  }
}
