# Migración de Catálogos de Departamentos y Puestos

## 📋 Resumen

Se crearon catálogos normalizados para **Departamentos** y **Puestos**, migrando desde campos de texto libre en la tabla `employees` a relaciones FK.

## 🗂️ Catálogos Creados

### Departments
- 11 departamentos predefinidos
- Campos: `id`, `name`, `description`, `isActive`

### Positions  
- 14 puestos predefinidos
- Campos: `id`, `name`, `description`, `isActive`

## 🚀 Pasos de Migración

### 1. Iniciar el servidor backend
```bash
npm run start:dev
```

### 2. Poblar los catálogos con datos existentes
```bash
npm run seed:catalogs
```

Este comando creará:
- 11 departamentos (Calidad, Producción, RH, etc.)
- 14 puestos (Inspector de calidad, Operador, Gerente, etc.)

### 3. Migrar empleados existentes
```bash
npm run migrate:employees
```

Este comando:
- Lee los campos `position` y `department` (texto) de cada empleado
- Busca coincidencias en los catálogos (case-insensitive)
- Actualiza `position_id` y `department_id` con las FK correspondientes
- Reporta cualquier valor no encontrado en los catálogos

## 📊 Cambios en la Entidad Employee

### Campos Legacy (deprecados)
- `position` (text) - Marcado como deprecated
- `department` (text) - Marcado como deprecated

### Nuevos Campos
- `positionId` (uuid) - FK a tabla `positions`
- `departmentId` (uuid) - FK a tabla `departments`
- `positionRelation` - Relación ManyToOne con eager loading
- `departmentRelation` - Relación ManyToOne con eager loading

## 🔍 Verificación

Después de la migración, verifica en GraphQL:

```graphql
query {
  employees(limit: 10) {
    id
    firstName
    lastName
    position # Campo legacy
    department # Campo legacy
    positionRelation {
      id
      name
    }
    departmentRelation {
      id
      name
    }
  }
}
```

## ⚠️ Notas Importantes

1. Los campos `position` y `department` (texto) se mantienen temporalmente para compatibilidad
2. Nuevos empleados deben usar `positionId` y `departmentId`
3. En una futura versión se eliminarán los campos legacy
4. Si hay valores no encontrados durante la migración, deberás:
   - Crear los departamentos/puestos faltantes manualmente
   - Re-ejecutar el script de migración

## 📝 Queries GraphQL Disponibles

### Departamentos
```graphql
query {
  departments {
    id
    name
    description
    isActive
  }
}

mutation {
  createDepartment(createDepartmentInput: {
    name: "Nuevo Departamento"
    description: "Descripción opcional"
  }) {
    id
    name
  }
}
```

### Puestos
```graphql
query {
  positions {
    id
    name
    description
    isActive
  }
}

mutation {
  createPosition(createPositionInput: {
    name: "Nuevo Puesto"
    description: "Descripción opcional"
  }) {
    id
    name
  }
}
```
