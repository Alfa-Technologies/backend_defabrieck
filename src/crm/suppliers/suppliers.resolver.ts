import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
} from '@nestjs/graphql';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierInput, UpdateSupplierInput } from './dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { PaginationArgs } from '../../common/dto/args/pagination.args';

@Resolver(() => Supplier)
export class SuppliersResolver {
  constructor(
    private readonly suppliersService: SuppliersService,
  ) {}

  @Mutation(() => Supplier, { name: 'createSupplier' })
  createSupplier(
    @Args('createSupplierInput') createSupplierInput: CreateSupplierInput,
  ): Promise<Supplier> {
    return this.suppliersService.create(createSupplierInput);
  }

  @Query(() => [Supplier], { name: 'suppliers' })
  findAll(@Args() paginationArgs: PaginationArgs): Promise<Supplier[]> {
    return this.suppliersService.findAll(paginationArgs);
  }

  @Query(() => Supplier, { name: 'supplier' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Supplier> {
    return this.suppliersService.findOne(id);
  }

  @Mutation(() => Supplier, { name: 'updateSupplier' })
  updateSupplier(
    @Args('updateSupplierInput') updateSupplierInput: UpdateSupplierInput,
  ): Promise<Supplier> {
    return this.suppliersService.update(
      updateSupplierInput.id,
      updateSupplierInput,
    );
  }

  @Mutation(() => Supplier, { name: 'removeSupplier' })
  removeSupplier(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('isActive', { type: () => Boolean, defaultValue: false })
    isActive: boolean,
  ): Promise<Supplier> {
    return this.suppliersService.remove(id, isActive);
  }
}
