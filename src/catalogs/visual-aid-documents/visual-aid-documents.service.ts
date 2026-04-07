import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateVisualAidDocumentInput,
  UpdateVisualAidDocumentInput,
} from './dto';
import { VisualAidDocument } from './entities/visual-aid-document.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { User } from '../../iam/users/entities/user.entity';
import { VisualAidStatus } from './constants/visual-aid-status.enum';

@Injectable()
export class VisualAidDocumentsService {
  private readonly logger = new Logger('VisualAidDocumentsService');

  constructor(
    @InjectRepository(VisualAidDocument)
    private readonly visualAidRepository: Repository<VisualAidDocument>,
  ) {}

  async create(
    createInput: CreateVisualAidDocumentInput,
    user: User,
  ): Promise<VisualAidDocument> {
    try {
      const newDoc = this.visualAidRepository.create({
        ...createInput,
        status: VisualAidStatus.DRAFT,
        currentRevision: createInput.currentRevision || '01',
        currentRevisionDate:
          createInput.currentRevisionDate ||
          new Date().toISOString().split('T')[0],
      });

      return await this.visualAidRepository.save(newDoc, {
        data: { userId: user.id },
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<VisualAidDocument[]> {
    const { limit, offset } = paginationArgs;
    return this.visualAidRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<VisualAidDocument> {
    const doc = await this.visualAidRepository.findOne({
      where: { id },
    });
    if (!doc)
      throw new NotFoundException(
        `No se encontró el documento de ayuda visual con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return doc;
  }

  async update(
    id: string,
    updateInput: UpdateVisualAidDocumentInput,
    user: User,
  ): Promise<VisualAidDocument> {
    const doc = await this.visualAidRepository.preload({
      ...updateInput,
      id,
    });
    if (!doc)
      throw new NotFoundException(
        `No se encontró el documento de ayuda visual con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    if (
      updateInput.status === VisualAidStatus.REJECTED &&
      updateInput.activeRejectionReason
    ) {
      await this.handleRejectionReset(
        doc,
        updateInput.activeRejectionReason,
        user,
      );
      return doc;
    }

    return this.visualAidRepository.save(doc, {
      data: { userId: user.id },
    });
  }

  async remove(
    id: string,
    isActive: boolean,
    user: User,
  ): Promise<VisualAidDocument> {
    const doc = await this.findOne(id);
    doc.isActive = isActive;

    return this.visualAidRepository.save(doc, {
      data: { userId: user.id },
    });
  }

  async signVisualAidAsCustomer(
    id: string,
    signatureUrl: string,
    user: User,
  ): Promise<VisualAidDocument> {
    const doc = await this.findOne(id);

    doc.customerSignedAt = new Date();
    doc['customerSignatureUrl'] = signatureUrl;

    return await this.visualAidRepository.save(doc, {
      data: { userId: user.id },
    });
  }

  async signVisualAidAsFinalCustomer(
    id: string,
    signatureUrl: string,
    user: User,
  ): Promise<VisualAidDocument> {
    const doc = await this.findOne(id);

    if (!doc.customerSignedAt) {
      throw new BadRequestException(
        'El cliente principal debe firmar antes que el cliente final.',
      );
    }

    doc.finalCustomerSignedAt = new Date();
    doc['finalCustomerSignatureUrl'] = signatureUrl;

    return await this.visualAidRepository.save(doc, {
      data: { userId: user.id },
    });
  }

  async signVisualAidAsInternal(
    id: string,
    signatureUrl: string,
    user: User,
  ): Promise<VisualAidDocument> {
    const doc = await this.findOne(id);

    if (!doc.customerSignedAt) {
      throw new BadRequestException(
        'La ayuda visual no puede ser aprobada internamente sin la firma del cliente.',
      );
    }

    doc.internalSignedAt = new Date();
    doc['internalSignatureUrl'] = signatureUrl;

    doc.status = VisualAidStatus.APPROVED;

    return await this.visualAidRepository.save(doc, {
      data: { userId: user.id },
    });
  }

  private async handleRejectionReset(
    doc: VisualAidDocument,
    rejectionReason: string,
    user: User,
  ): Promise<void> {
    doc.customerSignedAt = undefined;
    doc['customerSignatureUrl'] = undefined;
    doc.finalCustomerSignedAt = undefined;
    doc['finalCustomerSignatureUrl'] = undefined;
    doc.internalSignedAt = undefined;
    doc['internalSignatureUrl'] = undefined;
    doc.activeRejectionReason = rejectionReason;

    if (
      doc.status === VisualAidStatus.APPROVED ||
      doc.status === VisualAidStatus.ACTIVE
    ) {
      doc.status = VisualAidStatus.DRAFT;
    }

    await this.visualAidRepository.save(doc, {
      data: { userId: user.id },
    });

    this.logger.warn(
      `VisualAid ${doc.id} rejected and reset to DRAFT. Reason: ${rejectionReason}`,
    );
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23503') {
      throw new BadRequestException(
        `La parte de proyecto asignada no existe en el sistema. Por favor, verifique que la parte esté registrada primero.`,
      );
    }
    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
