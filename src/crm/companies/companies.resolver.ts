import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CreateCompanyInput, UpdateCompanyInput } from './dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { PaginationArgs } from '../../common/dto/args/pagination.args';
import { Plant } from '../plants/entities/plant.entity';
import { CompanyContact } from '../company-contacts/entities/company-contact.entity';
import { PartCatalog } from '../../catalogs/part-catalog/entities/part-catalog.entity';
import { CompaniesLoader } from './companies.loader';

@Resolver(() => Company)
export class CompaniesResolver {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly companiesLoader: CompaniesLoader,
  ) {}

  @Mutation(() => Company, { name: 'createCompany' })
  createCompany(
    @Args('createCompanyInput') createCompanyInput: CreateCompanyInput,
  ): Promise<Company> {
    return this.companiesService.create(createCompanyInput);
  }

  @Query(() => [Company], { name: 'companies' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Company[]> {
    return this.companiesService.findAll(paginationArgs);
  }

  @Query(() => Company, { name: 'company' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Mutation(() => Company, { name: 'updateCompany' })
  updateCompany(
    @Args('updateCompanyInput') updateCompanyInput: UpdateCompanyInput,
  ): Promise<Company> {
    return this.companiesService.update(
      updateCompanyInput.id,
      updateCompanyInput,
    );
  }

  @Mutation(() => Company, { name: 'removeCompany' })
  removeCompany(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<Company> {
    return this.companiesService.remove(id, isActive);
  }

  @ResolveField(() => [Plant], { nullable: true })
  async plants(@Parent() company: Company): Promise<Plant[]> {
    return this.companiesLoader.batchPlants.load(company.id);
  }

  @ResolveField(() => [CompanyContact], { nullable: true })
  async companyContacts(@Parent() company: Company): Promise<CompanyContact[]> {
    return this.companiesLoader.batchCompanyContacts.load(company.id);
  }

  @ResolveField(() => [PartCatalog], { nullable: true })
  async partCatalogs(@Parent() company: Company): Promise<PartCatalog[]> {
    return this.companiesLoader.batchPartCatalogs.load(company.id);
  }
}
