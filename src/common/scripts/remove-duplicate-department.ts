import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';

async function removeDuplicateDepartment() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🗑️  Eliminando departamento duplicado "Dirección" (con tilde)...\n');

  try {
    // Buscar el departamento "Dirección" con tilde
    const deptWithTilde = await dataSource.query(`
      SELECT id, name FROM departments WHERE name = 'Dirección'
    `);

    if (deptWithTilde.length === 0) {
      console.log('✅ No se encontró el departamento duplicado. Ya está limpio.');
      await app.close();
      return;
    }

    const deptId = deptWithTilde[0].id;
    console.log(`📂 Encontrado: "${deptWithTilde[0].name}" (ID: ${deptId})`);

    // Verificar si hay puestos o empleados asignados a este departamento
    const positionsCount = await dataSource.query(`
      SELECT COUNT(*) as count FROM positions WHERE department_id = $1
    `, [deptId]);

    const employeesCount = await dataSource.query(`
      SELECT COUNT(*) as count FROM employees WHERE department_id = $1
    `, [deptId]);

    console.log(`  - Puestos asignados: ${positionsCount[0].count}`);
    console.log(`  - Empleados asignados: ${employeesCount[0].count}`);

    if (positionsCount[0].count > 0 || employeesCount[0].count > 0) {
      console.log('\n⚠️  Este departamento tiene datos asignados. No se puede eliminar automáticamente.');
      console.log('   Por favor, reasigna los datos manualmente primero.');
    } else {
      // Eliminar el departamento (soft delete)
      await dataSource.query(`
        UPDATE departments SET is_active = false WHERE id = $1
      `, [deptId]);

      console.log('\n✅ Departamento desactivado exitosamente.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

removeDuplicateDepartment();
