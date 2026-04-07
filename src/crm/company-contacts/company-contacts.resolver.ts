import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { CompanyContactsService } from './company-contacts.service';
import { CompanyContact } from './entities/company-contact.entity';
import { CreateCompanyContactInput, UpdateCompanyContactInput } from './dto';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { User } from '../../iam/users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { UsersService } from '../../iam/users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { CompanyContactsLoader } from './company-contacts.loader';

@Resolver(() => CompanyContact)
export class CompanyContactsResolver {
  constructor(
    private readonly companyContactsService: CompanyContactsService,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly companyContactsLoader: CompanyContactsLoader,
  ) {}

  @Mutation(() => CompanyContact, { name: 'createCompanyContact' })
  createCompanyContact(
    @Args('createCompanyContactInput')
    createCompanyContactInput: CreateCompanyContactInput,
  ): Promise<CompanyContact> {
    return this.companyContactsService.create(createCompanyContactInput);
  }

  @Query(() => [CompanyContact], { name: 'companyContacts' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<CompanyContact[]> {
    return this.companyContactsService.findAll(paginationArgs);
  }

  @Query(() => CompanyContact, { name: 'companyContact' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<CompanyContact> {
    return this.companyContactsService.findOne(id);
  }

  @Mutation(() => CompanyContact, { name: 'updateCompanyContact' })
  updateCompanyContact(
    @Args('updateCompanyContactInput')
    updateCompanyContactInput: UpdateCompanyContactInput,
  ): Promise<CompanyContact> {
    return this.companyContactsService.update(
      updateCompanyContactInput.id,
      updateCompanyContactInput,
    );
  }

  @Mutation(() => CompanyContact, { name: 'removeCompanyContact' })
  removeCompanyContact(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<CompanyContact> {
    return this.companyContactsService.remove(id, isActive);
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() contact: CompanyContact): Promise<User | null> {
    if (!contact.userId) {
      return null;
    }
    return this.companyContactsLoader.batchUser.load(contact.userId);
  }

  @ResolveField(() => Company, { nullable: true })
  async company(@Parent() contact: CompanyContact): Promise<Company | null> {
    if (!contact.companyId) {
      return null;
    }
    return this.companyContactsLoader.batchCompany.load(contact.companyId);
  }

  @ResolveField(() => String)
  displayName(@Parent() contact: CompanyContact): string {
    return `${contact.firstName} ${contact.lastName}`.trim();
  }

  @ResolveField(() => String)
  email(@Parent() contact: CompanyContact): string {
    if (contact.user && contact.user.email) {
      return contact.user.email;
    }
    return contact.email || '';
  }
}
