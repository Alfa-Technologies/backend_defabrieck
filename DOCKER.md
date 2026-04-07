# 🐳 Guía de Docker para deFabrieckOS

Esta guía te ayudará a ejecutar la aplicación usando Docker y Docker Compose.

## 📋 Requisitos Previos

- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido con Docker Desktop)

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y ajusta las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores reales.

### 2. Construir y Levantar los Servicios

```bash
# Construir las imágenes y levantar los contenedores
docker-compose up --build

# O en modo detached (segundo plano)
docker-compose up -d --build
```

### 3. Verificar que Todo Funciona

- **API GraphQL**: http://localhost:3000/graphql
- **Base de Datos**: localhost:5432

## 🛠️ Comandos Útiles

### Ver logs de los servicios

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f api

# Ver logs solo de la base de datos
docker-compose logs -f db
```

### Detener los servicios

```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores y volúmenes (⚠️ BORRA LA BASE DE DATOS)
docker-compose down -v
```

### Reiniciar servicios

```bash
# Reiniciar todos los servicios
docker-compose restart

# Reiniciar solo el backend
docker-compose restart api
```

### Ejecutar comandos dentro del contenedor

```bash
# Acceder al shell del contenedor del backend
docker exec -it defabrieck-api sh

# Ejecutar migraciones de TypeORM
docker exec -it defabrieck-api yarn typeorm migration:run

# Ver logs de un contenedor específico
docker logs defabrieck-api
```

### Reconstruir solo el backend

```bash
# Si hiciste cambios en el código
docker-compose up -d --build api
```

## 🗄️ Base de Datos

### Acceder a PostgreSQL

```bash
# Desde la línea de comandos
docker exec -it defabrieck-db psql -U admin -d defabrieck_OS

# O usando un cliente como DBeaver/pgAdmin
Host: localhost
Port: 5432
Database: defabrieck_OS
User: admin
Password: Def_123
```

### Backup de la Base de Datos

```bash
# Crear backup
docker exec defabrieck-db pg_dump -U admin defabrieck_OS > backup.sql

# Restaurar backup
docker exec -i defabrieck-db psql -U admin defabrieck_OS < backup.sql
```

## 🔧 Desarrollo

### Modo Desarrollo con Hot Reload

Para desarrollo, puedes modificar el `docker-compose.yml` para usar hot reload:

```yaml
api:
  # ... otras configuraciones
  command: yarn start:dev  # En lugar de node dist/main
  volumes:
    - ./src:/app/src
    - ./node_modules:/app/node_modules
```

### Variables de Entorno

Las variables en `docker-compose.yml` sobrescriben las del archivo `.env`. Para producción, ajusta:

- `JWT_SECRET`: Usa un secreto fuerte y único
- `DB_PASSWORD`: Cambia la contraseña por defecto
- `NODE_ENV`: Asegúrate que esté en `production`

## 🐛 Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs api

# Verificar el estado de los contenedores
docker-compose ps
```

### Error de conexión a la base de datos

1. Verifica que el contenedor de PostgreSQL esté corriendo:
   ```bash
   docker-compose ps db
   ```

2. Verifica las variables de entorno en `docker-compose.yml`

3. Espera a que el healthcheck de la base de datos pase:
   ```bash
   docker-compose logs db
   ```

### Limpiar todo y empezar de nuevo

```bash
# ⚠️ CUIDADO: Esto eliminará todos los datos
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 📦 Estructura de Archivos Docker

```
svs-os-defabrieck/
├── Dockerfile              # Imagen del backend NestJS
├── docker-compose.yml      # Orquestación de servicios
├── .dockerignore          # Archivos a ignorar en la imagen
└── .env.example           # Ejemplo de variables de entorno
```

## 🚀 Despliegue en Producción

Para producción, considera:

1. **Usar secretos seguros**: No hardcodees contraseñas
2. **Configurar HTTPS**: Usa un reverse proxy (Nginx/Traefik)
3. **Backups automáticos**: Configura backups de la base de datos
4. **Monitoreo**: Implementa logs y métricas
5. **Volúmenes persistentes**: Asegura que los datos persistan

### Ejemplo con Nginx (opcional)

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - api
```

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Best Practices](https://docs.nestjs.com/recipes/docker)
