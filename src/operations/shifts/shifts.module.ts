import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftsService } from './shifts.service';
import { ShiftsResolver } from './shifts.resolver';
import { Shift } from './entities/shift.entity';
import { Plant } from '../../crm/plants/entities/plant.entity';
import { Project } from '../projects/entities/project.entity';
import { ShiftsLoader } from './shifts.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, Plant, Project])],
  providers: [ShiftsResolver, ShiftsService, ShiftsLoader],
  exports: [ShiftsService, ShiftsLoader],
})
export class ShiftsModule {}
