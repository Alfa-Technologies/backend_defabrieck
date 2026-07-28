import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';

async function deleteInactiveDireccion() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🗑️  Eliminando permanentemente departamento "Dirección" inactivo...\n');

  try {
    // Eliminar físicamente el departamento "Dirección" con tilde que está inactivo
    const result = await dataSource.query(`
      DELETE FROM departments 
      WHERE name = 'Dirección' AND is_active = false
      RETURNING id, name
    `);

    if (result.length > 0) {
      console.log(`✅ Departamento "${result[0].name}" eliminado permanentemente (ID: ${result[0].id})`);
    } else {
      console.log('ℹ️  No se encontró ningún departamento "Dirección" inactivo para eliminar.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

deleteInactiveDireccion();
