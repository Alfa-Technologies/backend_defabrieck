import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

import { GetUsersArgs } from './args/get-users.args';
import { CompanyContact } from 'src/crm/company-contacts/entities/company-contact.entity';
import { Employee } from '../employees/entities/employee.entity';
import { UsersLoader } from './users.loader';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersLoader: UsersLoader,
  ) {}

  @Mutation(() => User, { name: 'createUser' })
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser([ValidRoles.admin]) user: User,
  ): Promise<User> {
    return this.usersService.create(createUserInput, user);
  }

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() args: GetUsersArgs,
    @CurrentUser([ValidRoles.admin]) user: User,
  ): Promise<User[]> {
    return this.usersService.findAll(args.roles, args);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) user: User,
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User, { name: 'changeUserStatus' })
  async removeUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('isActive', { type: () => Boolean }) isActive: boolean,
    @CurrentUser([ValidRoles.admin]) user: User,
  ): Promise<User> {
    return this.usersService.remove(id, isActive, user);
  }

  @ResolveField(() => Employee, { nullable: true })
  async employee(@Parent() user: User): Promise<Employee | null> {
    return this.usersLoader.batchEmployees.load(user.id);
  }

  @ResolveField(() => CompanyContact, { nullable: true })
  async companyContact(@Parent() user: User): Promise<CompanyContact | null> {
    return this.usersLoader.batchContacts.load(user.id);
  }
}
