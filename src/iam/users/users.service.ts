import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './dto';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Employee } from '../employees/entities/employee.entity';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(CompanyContact)
    private readonly contactRepository: Repository<CompanyContact>,
  ) {}

  async create(
    createUserInput: CreateUserInput,
    adminUser: User,
  ): Promise<User> {
    try {
      const { password, employeeId, companyContactId, ...userData } =
        createUserInput as any;

      if (employeeId && companyContactId) {
        throw new BadRequestException(
          'Un usuario no puede ser empleado y contacto a la vez.',
        );
      }

      const newUser = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        roles: userData.roles ?? [ValidRoles.user],
        createdBy: adminUser.id,
        lastUpdateBy: adminUser.id,
      });

      const savedUser = (await this.userRepository.save(
        newUser,
      )) as unknown as User;

      if (employeeId) {
        const employee = await this.employeeRepository.findOne({
          where: { id: employeeId },
        });
        if (!employee)
          throw new NotFoundException('El empleado seleccionado no existe.');
        if (employee.userId)
          throw new ConflictException(
            'Este empleado ya tiene un usuario asignado.',
          );

        await this.employeeRepository.update(employeeId, {
          userId: savedUser.id,
        });
      } else if (companyContactId) {
        const contact = await this.contactRepository.findOne({
          where: { id: companyContactId },
        });
        if (!contact)
          throw new NotFoundException('El contacto seleccionado no existe.');
        if (contact.userId)
          throw new ConflictException(
            'Este contacto ya tiene un usuario asignado.',
          );

        await this.contactRepository.update(companyContactId, {
          userId: savedUser.id,
        });
      } else {
        await Promise.all([
          this.employeeRepository.update(
            { email: savedUser.email },
            { userId: savedUser.id },
          ),
          this.contactRepository.update(
            { email: savedUser.email },
            { userId: savedUser.id },
          ),
        ]);
      }

      return await this.findOneById(savedUser.id);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(
    roles: ValidRoles[],
    paginationArgs: PaginationArgs,
  ): Promise<User[]> {
    const { limit, offset } = paginationArgs;

    if (!roles || roles.length === 0) {
      return this.userRepository.find({
        take: limit,
        skip: offset,
      });
    }

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.roles && :roles', { roles })
      .take(limit)
      .skip(offset)
      .getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({
        where: { email },
      });
    } catch (error) {
      throw new NotFoundException(
        `No se encontró ningún usuario registrado con el correo ${email}.`,
      );
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(
        `No se encontró el usuario con el ID ${id}. Verifique que el identificador sea correcto.`,
      );
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    adminUser: User,
  ): Promise<User> {
    const { id: _, password, isActive, ...toUpdate } = updateUserInput as any;

    const user = await this.userRepository.preload({
      id,
      ...toUpdate,
    });

    if (!user)
      throw new NotFoundException(
        `No se encontró el usuario con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    user.lastUpdateBy = adminUser.id;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string, isActive: boolean, adminUser: User): Promise<User> {
    const user = await this.findOneById(id);

    user.isActive = isActive;
    user.lastUpdateBy = adminUser.id;

    return await this.userRepository.save(user);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException(
        `Ya existe un usuario registrado con este correo electrónico. Por favor, utilice otro correo o recupere su contraseña si ya tiene una cuenta.`,
      );
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        `La referencia proporcionada no existe en el sistema. Verifique que todos los datos relacionados sean válidos.`,
      );
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado en la base de datos. Por favor, contacte al administrador del sistema.',
    );
  }
}
