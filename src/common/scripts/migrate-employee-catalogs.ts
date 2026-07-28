import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { EmployeesService } from '../../iam/employees/employees.service';
import { DepartmentsService } from '../../catalogs/departments/departments.service';
import { PositionsService } from '../../catalogs/positions/positions.service';
import { DataSource } from 'typeorm';

async function migrateEmployeeCatalogs() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const employeesService = app.get(EmployeesService);
  const departmentsService = app.get(DepartmentsService);
  const positionsService = app.get(PositionsService);
  const dataSource = app.get(DataSource);

  console.log('🔄 Iniciando migración de empleados a catálogos...\n');

  try {
    // Obtener todos los departamentos y puestos
    const departments = await departmentsService.findAll({ limit: 100, offset: 0 });
    const positions = await positionsService.findAll({ limit: 100, offset: 0 });

    console.log(`📂 Departamentos disponibles: ${departments.length}`);
    console.log(`👔 Puestos disponibles: ${positions.length}\n`);

    // Crear mapas para búsqueda rápida (case-insensitive)
    const departmentMap = new Map(
      departments.map(d => [d.name.toLowerCase().trim(), d.id])
    );
    const positionMap = new Map(
      positions.map(p => [p.name.toLowerCase().trim(), p.id])
    );

    // Obtener todos los empleados con datos legacy
    const employees = await dataSource.query(`
      SELECT id, position, department 
      FROM employees 
      WHERE (position IS NOT NULL OR department IS NOT NULL)
        AND (position_id IS NULL OR department_id IS NULL)
    `);

    console.log(`👥 Empleados a migrar: ${employees.length}\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    const notFoundDepartments = new Set<string>();
    const notFoundPositions = new Set<string>();

    for (const employee of employees) {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Migrar departamento
      if (employee.department && !employee.department_id) {
        const deptKey = employee.department.toLowerCase().trim();
        const deptId = departmentMap.get(deptKey);
        
        if (deptId) {
          updates.push(`department_id = $${paramIndex++}`);
          values.push(deptId);
        } else {
          notFoundDepartments.add(employee.department);
        }
      }

      // Migrar puesto
      if (employee.position && !employee.position_id) {
        const posKey = employee.position.toLowerCase().trim();
        const posId = positionMap.get(posKey);
        
        if (posId) {
          updates.push(`position_id = $${paramIndex++}`);
          values.push(posId);
        } else {
          notFoundPositions.add(employee.position);
        }
      }

      if (updates.length > 0) {
        values.push(employee.id);
        await dataSource.query(
          `UPDATE employees SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
          values
        );
        migratedCount++;
        console.log(`  ✅ Empleado ${employee.id} migrado`);
      } else {
        skippedCount++;
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`  ✅ Empleados migrados: ${migratedCount}`);
    console.log(`  ⏭️  Empleados omitidos: ${skippedCount}`);

    if (notFoundDepartments.size > 0) {
      console.log('\n⚠️  Departamentos no encontrados en catálogo:');
      notFoundDepartments.forEach(dept => console.log(`  - ${dept}`));
    }

    if (notFoundPositions.size > 0) {
      console.log('\n⚠️  Puestos no encontrados en catálogo:');
      notFoundPositions.forEach(pos => console.log(`  - ${pos}`));
    }

    console.log('\n✨ Migración completada!\n');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

migrateEmployeeCatalogs();
