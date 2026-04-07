import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceLog } from './entities/attendance-log.entity';
import { CreateAttendanceInput, UpdateAttendanceInput } from './dto';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator';
import { User } from '../../iam/users/entities/user.entity';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Employee } from '../../iam/employees/entities/employee.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { AttendanceLoader } from './attendance.loader';

@Resolver(() => AttendanceLog)
@UseGuards(JwtAuthGuard)
export class AttendanceResolver {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceLoader: AttendanceLoader,
  ) {}

  @Mutation(() => AttendanceLog)
  createAttendance(
    @Args('createAttendanceInput') createInput: CreateAttendanceInput,
    @CurrentUser() user: User,
  ): Promise<AttendanceLog> {
    return this.attendanceService.create(createInput, user);
  }

  @Mutation(() => AttendanceLog)
  updateAttendance(
    @Args('updateAttendanceInput') updateInput: UpdateAttendanceInput,
    @CurrentUser() user: User,
  ): Promise<AttendanceLog> {
    return this.attendanceService.update(updateInput.id, updateInput, user);
  }

  @Query(() => [AttendanceLog], { name: 'attendanceLogs' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<AttendanceLog[]> {
    return this.attendanceService.findAll(paginationArgs);
  }

  @Query(() => [AttendanceLog], { name: 'attendanceByEmployee' })
  findByEmployee(
    @Args('employeeId', { type: () => ID }, ParseUUIDPipe) employeeId: string,
  ): Promise<AttendanceLog[]> {
    return this.attendanceService.findByEmployee(employeeId);
  }

  @Query(() => [AttendanceLog], { name: 'activeEmployeesInPlant' })
  findActiveInPlant(
    @Args('plantId', { type: () => ID }, ParseUUIDPipe) plantId: string,
  ): Promise<AttendanceLog[]> {
    return this.attendanceService.findActivePeople(plantId);
  }

  // ResolveFields con DataLoader
  @ResolveField(() => Employee, { nullable: true })
  async employee(@Parent() log: AttendanceLog): Promise<Employee | null> {
    if (!log.employeeId) {
      return null;
    }
    return this.attendanceLoader.batchEmployees.load(log.employeeId);
  }

  @ResolveField(() => Plant, { nullable: true })
  async plant(@Parent() log: AttendanceLog): Promise<Plant | null> {
    if (!log.plantId) {
      return null;
    }
    return this.attendanceLoader.batchPlants.load(log.plantId);
  }

  @ResolveField(() => User, { nullable: true })
  async createdBy(@Parent() log: AttendanceLog): Promise<User | null> {
    if (!log.createdById) {
      return null;
    }
    return this.attendanceLoader.batchUsers.load(log.createdById);
  }
}
