import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DepartmentsService } from '../../catalogs/departments/departments.service';
import { PositionsService } from '../../catalogs/positions/positions.service';
import { DataSource } from 'typeorm';
import { POSITIONS_WITH_DEPARTMENTS } from '../../catalogs/positions/seed-positions-with-departments.data';

async function assignDepartmentsToPositions() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const departmentsService = app.get(DepartmentsService);
  const positionsService = app.get(PositionsService);
  const dataSource = app.get(DataSource);

  console.log('🔗 Asignando departamentos a puestos...\n');

  try {
    // Obtener todos los departamentos
    const departments = await departmentsService.findAll({ limit: 100, offset: 0 });
    const departmentMap = new Map(
      departments.map(d => [d.name.toLowerCase().trim(), d.id])
    );

    console.log(`📂 Departamentos disponibles: ${departments.length}\n`);

    let updatedCount = 0;
    let notFoundDepartments = new Set<string>();

    for (const posData of POSITIONS_WITH_DEPARTMENTS) {
      const deptKey = posData.departmentName.toLowerCase().trim();
      const deptId = departmentMap.get(deptKey);

      if (!deptId) {
        notFoundDepartments.add(posData.departmentName);
        console.log(`  ⚠️  Departamento "${posData.departmentName}" no encontrado para puesto "${posData.name}"`);
        continue;
      }

      // Buscar el puesto por nombre
      const positions = await dataSource.query(
        `SELECT id FROM positions WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))`,
        [posData.name]
      );

      if (positions.length === 0) {
        console.log(`  ⚠️  Puesto "${posData.name}" no encontrado en la base de datos`);
        continue;
      }

      const positionId = positions[0].id;

      // Actualizar el departmentId
      await dataSource.query(
        `UPDATE positions SET department_id = $1 WHERE id = $2`,
        [deptId, positionId]
      );

      updatedCount++;
      console.log(`  ✅ ${posData.name} → ${posData.departmentName}`);
    }

    console.log('\n📊 Resumen:');
    console.log(`  ✅ Puestos actualizados: ${updatedCount}`);

    if (notFoundDepartments.size > 0) {
      console.log('\n⚠️  Departamentos no encontrados:');
      notFoundDepartments.forEach(dept => console.log(`  - ${dept}`));
    }

    console.log('\n✨ Asignación completada!\n');
  } catch (error) {
    console.error('❌ Error durante la asignación:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

assignDepartmentsToPositions();
