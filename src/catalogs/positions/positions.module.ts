import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionsService } from './positions.service';
import { PositionsResolver } from './positions.resolver';
import { Position } from './entities/position.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position]),
  ],
  providers: [PositionsResolver, PositionsService],
  exports: [TypeOrmModule, PositionsService],
})
export class PositionsModule {}
