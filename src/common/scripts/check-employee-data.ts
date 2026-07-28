import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';

async function checkEmployeeData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('📊 Consultando relación departamento-puesto en empleados...\n');

  try {
    // Consultar combinaciones únicas de departamento y puesto
    const results = await dataSource.query(`
      SELECT DISTINCT department, position 
      FROM employees 
      WHERE department IS NOT NULL AND position IS NOT NULL
      ORDER BY department, position
    `);

    console.log('Relaciones encontradas:\n');
    
    const grouped = new Map<string, string[]>();
    
    for (const row of results) {
      const dept = row.department;
      const pos = row.position;
      
      if (!grouped.has(dept)) {
        grouped.set(dept, []);
      }
      grouped.get(dept)!.push(pos);
    }

    for (const [dept, positions] of grouped.entries()) {
      console.log(`\n📂 ${dept}:`);
      positions.forEach(pos => console.log(`  - ${pos}`));
    }

    console.log('\n✅ Consulta completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

checkEmployeeData();
