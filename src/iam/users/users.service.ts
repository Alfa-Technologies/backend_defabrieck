import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './dto';
import { SyncClaimsResult } from './types/sync-claims-result.type';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Employee } from '../employees/entities/employee.entity';
import { CompanyContact } from '../../crm/company-contacts/entities/company-contact.entity';
import { FirebaseService } from '../../infrastructure/firebase/firebase.service';

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

    private readonly firebaseService: FirebaseService,
  ) {}

  async create(
    createUserInput: CreateUserInput,
    adminUser: User,
  ): Promise<User> {
    const { password, employeeId, companyContactId, ...userData } =
      createUserInput as any;
    const roles: ValidRoles[] =
      userData.roles?.length ? userData.roles : [ValidRoles.user];

    // ── 1. Validación (antes de tocar Firebase, para no crear cuentas
    //       huérfanas si los datos de negocio son inválidos) ──
    if (employeeId && companyContactId) {
      throw new BadRequestException(
        'Un usuario no puede ser empleado y contacto a la vez.',
      );
    }
    if (!employeeId && !companyContactId) {
      throw new BadRequestException(
        'Debe indicar un empleado o un contacto para crear el usuario.',
      );
    }

    // Resolver displayName y validar que el vínculo exista y esté libre.
    let displayName: string;
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
      displayName = `${employee.firstName} ${employee.lastName}`.trim();
    } else {
      const contact = await this.contactRepository.findOne({
        where: { id: companyContactId },
      });
      if (!contact)
        throw new NotFoundException('El contacto seleccionado no existe.');
      if (contact.userId)
        throw new ConflictException(
          'Este contacto ya tiene un usuario asignado.',
        );
      displayName = `${contact.firstName} ${contact.lastName}`.trim();
    }

    // ── 2. Firebase Auth + Firestore + Postgres (con rollback granular) ──
    let uid: string | undefined;
    let firestoreCreated = false;

    try {
      // Firebase Auth: fuente de verdad de la identidad.
      const firebaseUser = await this.firebaseService.getAuth().createUser({
        email: userData.email,
        password,
        displayName,
      });
      uid = firebaseUser.uid;

      // Firestore súper-colección `users/{uid}`: perfil de acceso.
      await this.firebaseService
        .getUsersCollectionRef()
        .doc(uid)
        .set({ email: userData.email, displayName, isActive: true, roles });
      firestoreCreated = true;

      // Custom claims: espeja los roles al token de Firebase. Va dentro del try
      // para que un fallo dispare el rollback completo (no dejar cuenta a medias).
      await this.firebaseService.setUserRolesClaim(uid, roles);

      // Postgres: relación de negocio + firebaseUid. Sin password (Auth es la fuente).
      const newUser = this.userRepository.create({
        email: userData.email,
        roles,
        firebaseUid: uid,
        employeeId: employeeId ?? undefined,
        companyContactId: companyContactId ?? undefined,
        createdBy: adminUser.id,
        lastUpdateBy: adminUser.id,
      });

      const savedUser = (await this.userRepository.save(
        newUser,
      )) as unknown as User;

      // Enlace inverso userId en Employee/CompanyContact.
      if (employeeId) {
        await this.employeeRepository.update(employeeId, {
          userId: savedUser.id,
        });
      } else {
        await this.contactRepository.update(companyContactId, {
          userId: savedUser.id,
        });
      }

      return await this.findOneById(savedUser.id);
    } catch (error) {
      await this.rollbackFirebaseUser(uid, firestoreCreated);

      // Email duplicado en Postgres o en Firebase Auth → conflicto claro.
      if (
        error?.code === '23505' ||
        error?.code === 'auth/email-already-exists'
      ) {
        throw new ConflictException(
          'Ya existe un usuario registrado con este correo electrónico. Por favor, utilice otro correo.',
        );
      }

      this.logger.error('Error creando usuario políglota', error);
      throw new InternalServerErrorException(
        'No se pudo crear el usuario. Se revirtieron los cambios parciales. Contacte al administrador si persiste.',
      );
    }
  }

  /**
   * Limpia los recursos de Firebase creados durante un `create` fallido para
   * no dejar cuentas huérfanas. Se envuelve en try/catch para que un fallo al
   * limpiar no oculte el error original.
   */
  /**
   * Sincroniza la relación inversa del vínculo (employees.user_id /
   * company_contacts.user_id), que es lo que lee el loader. Libera el vínculo
   * anterior y asigna el nuevo, validando que el nuevo no tenga ya otro usuario.
   */
  private async syncInverseLink(
    previous: User,
    savedUser: User,
  ): Promise<void> {
    const prevEmployeeId = previous.employeeId ?? null;
    const prevContactId = previous.companyContactId ?? null;
    const newEmployeeId = savedUser.employeeId ?? null;
    const newContactId = savedUser.companyContactId ?? null;

    // Liberar vínculos anteriores que hayan cambiado. `() => 'NULL'` es la forma
    // idiomática de TypeORM para setear la columna a NULL en un update.
    if (prevEmployeeId && prevEmployeeId !== newEmployeeId) {
      await this.employeeRepository.update(prevEmployeeId, {
        userId: () => 'NULL',
      });
    }
    if (prevContactId && prevContactId !== newContactId) {
      await this.contactRepository.update(prevContactId, {
        userId: () => 'NULL',
      });
    }

    // Asignar el nuevo empleado (si cambió), validando que esté libre.
    if (newEmployeeId && newEmployeeId !== prevEmployeeId) {
      const employee = await this.employeeRepository.findOne({
        where: { id: newEmployeeId },
      });
      if (!employee)
        throw new NotFoundException('El empleado seleccionado no existe.');
      if (employee.userId && employee.userId !== savedUser.id)
        throw new ConflictException(
          'Este empleado ya tiene un usuario asignado.',
        );
      await this.employeeRepository.update(newEmployeeId, {
        userId: savedUser.id,
      });
    }

    // Asignar el nuevo contacto (si cambió), validando que esté libre.
    if (newContactId && newContactId !== prevContactId) {
      const contact = await this.contactRepository.findOne({
        where: { id: newContactId },
      });
      if (!contact)
        throw new NotFoundException('El contacto seleccionado no existe.');
      if (contact.userId && contact.userId !== savedUser.id)
        throw new ConflictException(
          'Este contacto ya tiene un usuario asignado.',
        );
      await this.contactRepository.update(newContactId, {
        userId: savedUser.id,
      });
    }
  }

  private async rollbackFirebaseUser(
    uid: string | undefined,
    firestoreCreated: boolean,
  ): Promise<void> {
    if (!uid) return;
    try {
      if (firestoreCreated) {
        await this.firebaseService.getUsersCollectionRef().doc(uid).delete();
      }
      await this.firebaseService.getAuth().deleteUser(uid);
    } catch (cleanupError) {
      this.logger.error(
        `Fallo al revertir usuario de Firebase (uid: ${uid})`,
        cleanupError,
      );
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

  async findOneByFirebaseUid(firebaseUid: string): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { firebaseUid },
    });
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
    // password/isActive se excluyen del update relacional: la contraseña vive en
    // Firebase Auth (se cambia aparte) y el estado se maneja vía changeUserStatus.
    const { id: _, password, isActive, ...toUpdate } = updateUserInput as any;

    // Solo re-sincronizamos claims si el input trae un cambio de roles.
    const rolesProvided = updateUserInput.roles !== undefined;
    const passwordProvided = password !== undefined;
    const vinculoChanged =
      updateUserInput.employeeId !== undefined ||
      updateUserInput.companyContactId !== undefined;

    // Estado previo del vínculo (para liberar la relación inversa anterior).
    const previous = await this.userRepository.findOne({ where: { id } });
    if (!previous)
      throw new NotFoundException(
        `No se encontró el usuario con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    const user = await this.userRepository.preload({
      id,
      ...toUpdate,
    });

    if (!user)
      throw new NotFoundException(
        `No se encontró el usuario con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    // Fail-fast: si se pide cambiar la contraseña, el usuario debe tener cuenta de
    // Firebase. Se valida ANTES de tocar Postgres para no dejar el registro
    // actualizado con la contraseña sin cambiar.
    if (passwordProvided && !user.firebaseUid) {
      throw new BadRequestException(
        'Este usuario no tiene una cuenta de Firebase asociada; no se puede cambiar la contraseña.',
      );
    }

    user.lastUpdateBy = adminUser.id;

    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }

    // Mantener la relación inversa (employees.user_id / company_contacts.user_id),
    // que es la fuente de verdad del vínculo que lee el loader. Al cambiar el
    // vínculo: liberar el anterior y asignar el nuevo (como en create()).
    if (vinculoChanged) {
      await this.syncInverseLink(previous, savedUser);
    }

    // Cambio de contraseña en Firebase Auth (operación administrativa).
    if (passwordProvided) {
      try {
        await this.firebaseService
          .getAuth()
          .updateUser(savedUser.firebaseUid!, { password });
      } catch (pwError) {
        this.logger.error(
          `Fallo al cambiar la contraseña del usuario ${id}`,
          pwError,
        );
        throw new InternalServerErrorException(
          'El usuario se actualizó pero no se pudo cambiar la contraseña. Reintente.',
        );
      }
    }

    // Espejar los nuevos roles al token de Firebase. Postgres ya quedó actualizado
    // (fuente de verdad); si la sync falla, se reporta para reintentar con el backfill.
    if (rolesProvided && savedUser.firebaseUid) {
      try {
        await this.firebaseService.setUserRolesClaim(
          savedUser.firebaseUid,
          savedUser.roles,
        );
        // Espejar los roles también al doc Firestore users/{uid} (para las reglas
        // y para que el perfil quede consistente con el token).
        await this.firebaseService.updateUserDoc(savedUser.firebaseUid, {
          roles: savedUser.roles,
        });
      } catch (claimError) {
        this.logger.error(
          `Usuario ${id} actualizado en PG pero falló la sync de claims`,
          claimError,
        );
        throw new InternalServerErrorException(
          'El usuario se actualizó pero no se pudieron sincronizar sus permisos en Firebase. Reintente la sincronización.',
        );
      }
    }

    // Si cambió el vínculo, recalcular el displayName y espejarlo a Firebase.
    if (vinculoChanged && savedUser.firebaseUid) {
      let displayName: string | undefined;
      if (savedUser.employeeId) {
        const emp = await this.employeeRepository.findOne({
          where: { id: savedUser.employeeId },
        });
        if (emp) displayName = `${emp.firstName} ${emp.lastName}`.trim();
      } else if (savedUser.companyContactId) {
        const con = await this.contactRepository.findOne({
          where: { id: savedUser.companyContactId },
        });
        if (con) displayName = `${con.firstName} ${con.lastName}`.trim();
      }

      // Si se desvinculó (ambos null), no hay fuente de nombre: se conserva el actual.
      if (displayName) {
        try {
          await this.firebaseService
            .getAuth()
            .updateUser(savedUser.firebaseUid, { displayName });
          await this.firebaseService.updateUserDoc(savedUser.firebaseUid, {
            displayName,
          });
        } catch (nameError) {
          this.logger.error(
            `Usuario ${id} actualizado en PG pero falló la sync del nombre`,
            nameError,
          );
          throw new InternalServerErrorException(
            'El usuario se actualizó pero no se pudo sincronizar el nombre en Firebase. Reintente.',
          );
        }
      }
    }

    return savedUser;
  }

  async remove(id: string, isActive: boolean, adminUser: User): Promise<User> {
    const user = await this.findOneById(id);

    user.isActive = isActive;
    user.lastUpdateBy = adminUser.id;

    const savedUser = await this.userRepository.save(user);

    // Espejar el estado a Firebase: deshabilitar la cuenta en Auth (bloquea el
    // login del usuario desactivado) y sincronizar el doc Firestore.
    if (savedUser.firebaseUid) {
      try {
        await this.firebaseService
          .getAuth()
          .updateUser(savedUser.firebaseUid, { disabled: !isActive });
        await this.firebaseService.updateUserDoc(savedUser.firebaseUid, {
          isActive,
        });
      } catch (statusError) {
        this.logger.error(
          `Estado del usuario ${id} actualizado en PG pero falló la sync en Firebase`,
          statusError,
        );
        throw new InternalServerErrorException(
          'El estado se actualizó en la base pero no se pudo sincronizar en Firebase. Reintente.',
        );
      }
    }

    return savedUser;
  }

  /**
   * Backfill: sincroniza los custom claims `roles` de todos los usuarios activos
   * que tengan `firebaseUid`. Secuencial y tolerante a fallos individuales.
   */
  async syncAllFirebaseClaims(): Promise<SyncClaimsResult> {
    const users = await this.userRepository.find({
      where: { isActive: true, firebaseUid: Not(IsNull()) },
    });

    let synced = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await this.firebaseService.setUserRolesClaim(
          user.firebaseUid!,
          user.roles,
        );
        synced++;
      } catch (error) {
        failed++;
        this.logger.error(
          `Fallo al sincronizar claims del usuario ${user.id}`,
          error,
        );
      }
    }

    return { total: users.length, synced, failed };
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
