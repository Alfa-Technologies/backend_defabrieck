import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceLog } from './entities/attendance-log.entity';
import { CreateAttendanceInput, UpdateAttendanceInput } from './dto';
import { User } from '../../iam/users/entities/user.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceLog)
    private readonly attendanceRepository: Repository<AttendanceLog>,
  ) {}

  async create(
    createInput: CreateAttendanceInput,
    user: User,
  ): Promise<AttendanceLog> {
    if (
      createInput.method === 'GPS' &&
      (!createInput.latitude || !createInput.longitude)
    ) {
      throw new BadRequestException(
        'GPS check-ins require latitude and longitude.',
      );
    }

    const newRecord = this.attendanceRepository.create({
      ...createInput,
      createdBy: user,
    });

    return await this.attendanceRepository.save(newRecord);
  }

  async update(
    id: string,
    updateInput: UpdateAttendanceInput,
    user: User,
  ): Promise<AttendanceLog> {
    const record = await this.attendanceRepository.findOneBy({ id });
    if (!record)
      throw new NotFoundException(
        `No se encontró el registro de asistencia con el ID ${id}. Verifique que el identificador sea correcto.`,
      );

    if (updateInput.type) record.type = updateInput.type;
    if (updateInput.plantId) record.plantId = updateInput.plantId;
    if (updateInput.timestamp) record.timestamp = updateInput.timestamp;

    record.method = 'MANUAL_ADJUSTMENT';
    record.createdBy = user;

    return await this.attendanceRepository.save(record);
  }

  async findAll(paginationArgs: PaginationArgs): Promise<AttendanceLog[]> {
    const { limit, offset } = paginationArgs;
    return this.attendanceRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findByEmployee(employeeId: string): Promise<AttendanceLog[]> {
    return this.attendanceRepository.find({
      where: { employeeId },
      order: { timestamp: 'DESC' },
    });
  }

  async findActivePeople(plantId: string): Promise<AttendanceLog[]> {
    const latestLogs = await this.attendanceRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.employee', 'employee')

      .distinctOn(['log.employee_id'])

      .where('log.plant_id = :plantId', { plantId })

      .orderBy('log.employee_id')
      .addOrderBy('log.timestamp', 'DESC')
      .getMany();

    return latestLogs.filter((log) => log.type === 'CHECK_IN');
  }
}
