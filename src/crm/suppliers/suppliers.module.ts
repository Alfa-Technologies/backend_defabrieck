import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service';
import { SuppliersResolver } from './suppliers.resolver';
import { Supplier } from './entities/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier]),
  ],
  providers: [SuppliersResolver, SuppliersService],
  exports: [TypeOrmModule, SuppliersService],
})
export class SuppliersModule {}
