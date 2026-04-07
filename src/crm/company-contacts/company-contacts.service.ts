import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyContactInput, UpdateCompanyContactInput } from './dto';
import { CompanyContact } from './entities/company-contact.entity';
import { User } from '../../iam/users/entities/user.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class CompanyContactsService {
  private readonly logger = new Logger('CompanyContactsService');
  constructor(
    @InjectRepository(CompanyContact)
    private readonly contactsRepository: Repository<CompanyContact>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    createInput: CreateCompanyContactInput,
  ): Promise<CompanyContact> {
    const { userId, ...rest } = createInput;

    let userArg: { id: string } | undefined = undefined;
    let userEmail: string | undefined = undefined;

    if (userId) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(
          `No se encontró el usuario con el ID ${userId}. Verifique que el identificador sea correcto.`,
        );
      }
      userArg = { id: userId };
      userEmail = user.email;
    }

    try {
      const newContact = this.contactsRepository.create({
        ...rest,
        user: userArg,
        email: userEmail || rest.email,
      });

      return await this.contactsRepository.save(newContact);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<CompanyContact[]> {
    const { limit, offset } = paginationArgs;
    return this.contactsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<CompanyContact> {
    const contact = await this.contactsRepository.findOneBy({ id });
    if (!contact)
      throw new NotFoundException(
        `No se encontró el contacto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    return contact;
  }

  async update(
    id: string,
    updateInput: UpdateCompanyContactInput,
  ): Promise<CompanyContact> {
    const { userId, id: inputId, ...rest } = updateInput;

    const contact = await this.contactsRepository.preload({
      id: inputId,
      ...rest,
    });
    if (!contact)
      throw new NotFoundException(
        `No se encontró el contacto con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    if (userId !== undefined) {
      if (userId) {
        const user = await this.usersRepository.findOne({
          where: { id: userId },
        });
        if (!user) {
          throw new NotFoundException(
            `No se encontró el usuario con el ID ${userId}. Verifique que el identificador sea correcto.`,
          );
        }
        contact.userId = userId;
        contact.email = user.email;
      } else {
        contact.userId = undefined;
        contact.user = undefined;
      }
    }

    return this.contactsRepository.save(contact);
  }

  async remove(id: string, isActive: boolean): Promise<CompanyContact> {
    const contact = await this.findOne(id);
    contact.isActive = isActive;
    return this.contactsRepository.save(contact);
  }

  private handleDBExceptions(error: any): never {
    // Duplicado de email o teléfono
    if (error.code === '23505') {
      const field = error.detail?.match(/\((.*?)\)/)?.[1] || 'proporcionado';
      throw new ConflictException(
        `El dato duplicado en ${field} ya existe en otro registro.`,
      );
    }

    // Empresa o usuario no existe (FK)
    if (error.code === '23503') {
      throw new BadRequestException(
        `La empresa o usuario asignado no existe en el sistema. Por favor, verifique las relaciones.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
