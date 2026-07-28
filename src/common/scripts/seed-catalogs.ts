import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DepartmentsService } from '../../catalogs/departments/departments.service';
import { PositionsService } from '../../catalogs/positions/positions.service';
import { SEED_DEPARTMENTS } from '../../catalogs/departments/seed-departments.data';
import { SEED_POSITIONS } from '../../catalogs/positions/seed-positions.data';

async function seedCatalogs() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const departmentsService = app.get(DepartmentsService);
  const positionsService = app.get(PositionsService);

  console.log('🌱 Iniciando seed de catálogos...\n');

  try {
    console.log('📂 Creando departamentos...');
    for (const dept of SEED_DEPARTMENTS) {
      try {
        const created = await departmentsService.create(dept);
        console.log(`  ✅ ${created.name}`);
      } catch (error) {
        if (error.status === 409) {
          console.log(`  ⚠️  ${dept.name} (ya existe)`);
        } else {
          console.log(`  ❌ Error al crear ${dept.name}:`, error.message);
        }
      }
    }

    console.log('\n👔 Creando puestos...');
    for (const pos of SEED_POSITIONS) {
      try {
        const created = await positionsService.create(pos);
        console.log(`  ✅ ${created.name}`);
      } catch (error) {
        if (error.status === 409) {
          console.log(`  ⚠️  ${pos.name} (ya existe)`);
        } else {
          console.log(`  ❌ Error al crear ${pos.name}:`, error.message);
        }
      }
    }

    console.log('\n✨ Seed completado exitosamente!\n');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

seedCatalogs();
