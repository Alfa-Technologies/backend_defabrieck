import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateDDMMYYYY')
export class DateDDMMYYYYScalar implements CustomScalar<string, string> {
  description = 'Fecha en formato DD/MM/YYYY';

  parseValue(value: string): string {
    // Convierte de DD/MM/YYYY a YYYY-MM-DD (formato PostgreSQL)
    if (!value) {
      return null as any;
    }

    const parts = value.split('/');
    if (parts.length !== 3) {
      throw new Error('Formato de fecha inválido. Se espera DD/MM/YYYY');
    }

    const [day, month, year] = parts.map(Number);

    // Validar que la fecha sea válida
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      throw new Error('Fecha inválida');
    }

    // Retornar en formato YYYY-MM-DD para PostgreSQL
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  serialize(value: Date | string): string {
    // Convierte de Date a DD/MM/YYYY
    if (!value) {
      return null as any;
    }

    // Si viene como string de PostgreSQL (YYYY-MM-DD), convertir primero
    let date: Date;
    if (typeof value === 'string') {
      const parts = value.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        date = new Date(year, month - 1, day);
      } else {
        return null as any;
      }
    } else {
      date = value;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    return null as any;
  }
}
