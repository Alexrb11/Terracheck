# TerrariumKeeper Backend

API REST para la gestión de terrarios de reptiles con autenticación JWT y sistema de roles dinámico.

## Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp env.example .env

# Editar .env con tu URI de MongoDB y JWT_SECRET
```

## Comandos

```bash
# Iniciar en desarrollo (con hot-reload)
npm run dev

# Iniciar en producción
npm start

# Poblar base de datos con datos de ejemplo
npm run seed
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/terrarium-keeper` |
| `PORT` | Puerto del servidor | `3000` |
| `FRONTEND_URL` | URL del frontend (CORS) | `http://localhost:5173` |
| `JWT_SECRET` | Clave secreta para JWT | (requerido en producción) |

## Autenticación

La API usa JWT (JSON Web Tokens) para autenticación.

### Flujo de autenticación:
1. Registrar usuario: `POST /api/auth/register`
2. Iniciar sesión: `POST /api/auth/login`
3. Usar token en header: `Authorization: Bearer <token>`

### Credenciales de prueba (después de ejecutar seed):

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Admin TerraCheck | admin@terracheck.com | admin123 | Super Admin |
| Usuario Demo | user@terracheck.com | user123 | Usuario |

## Sistema de Roles y Permisos

El sistema implementa RBAC (Role-Based Access Control) dinámico gestionado desde base de datos.

### Modelos

- **Permission**: Define acciones específicas (ej: `manage_users`, `manage_roles`)
- **Role**: Agrupa permisos y se asigna a usuarios (ej: "Super Admin", "Usuario")
- **User**: Referencia a un Role

### Permisos disponibles

| Slug | Nombre | Categoría |
|------|--------|-----------|
| `manage_users` | Gestionar Usuarios | users |
| `view_users` | Ver Usuarios | users |
| `manage_roles` | Gestionar Roles | roles |
| `manage_all_terrariums` | Gestionar Todos los Terrarios | terrariums |
| `view_all_terrariums` | Ver Todos los Terrarios | terrariums |
| `manage_all_animals` | Gestionar Todos los Animales | animals |
| `manage_species` | Gestionar Especies | species |
| `view_statistics` | Ver Estadísticas | system |
| `access_admin_panel` | Acceso Panel Admin | system |

### Roles de sistema

- **Super Admin**: Todos los permisos (`isSystem: true`)
- **Usuario**: Sin permisos especiales (`isSystem: true`)
- **Moderador**: Permisos parciales (ejemplo de rol personalizado)

## Endpoints API

### Auth (`/api/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/me` | Obtener usuario actual | Sí |
| PUT | `/me` | Actualizar perfil | Sí |
| PUT | `/password` | Cambiar contraseña | Sí |

### Species (`/api/species`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Lista de especies | Sí |
| GET | `/:id` | Detalle de especie | Sí |

### Terrariums (`/api/terrariums`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Lista terrarios del usuario | Sí |
| GET | `/:id` | Detalle de terrario | Sí |
| POST | `/` | Crear terrario | Sí |
| PUT | `/:id` | Actualizar terrario | Sí |
| DELETE | `/:id` | Eliminar terrario | Sí |

### Animals (`/api/animals`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Lista animales del usuario | Sí |
| GET | `/:id` | Detalle de animal | Sí |
| POST | `/` | Crear animal | Sí |
| PUT | `/:id` | Actualizar animal | Sí |
| DELETE | `/:id` | Eliminar animal | Sí |

### Admin - Usuarios (`/api/admin`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/stats` | Estadísticas del sistema | `view_statistics` |
| GET | `/users` | Lista de usuarios | `manage_users` |
| GET | `/users/:id` | Detalle de usuario | `manage_users` |
| PATCH | `/users/:id/role` | Cambiar rol de usuario | `manage_users` |
| PATCH | `/users/:id/status` | Activar/desactivar usuario | `manage_users` |
| DELETE | `/users/:id` | Eliminar usuario | `manage_users` |

### Admin - Roles (`/api/admin/roles`)

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/` | Lista de roles | `manage_roles` |
| GET | `/:id` | Detalle de rol | `manage_roles` |
| POST | `/` | Crear rol | `manage_roles` |
| PUT | `/:id` | Actualizar rol | `manage_roles` |
| DELETE | `/:id` | Eliminar rol | `manage_roles` |
| GET | `/permissions` | Lista de permisos | `manage_roles` |
| POST | `/permissions` | Crear permiso | `manage_roles` |

## Ejemplos de Uso

### Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan", "email": "juan@test.com", "password": "123456"}'
```

### Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@terracheck.com", "password": "admin123"}'
```

### Crear un rol nuevo (requiere admin)
```bash
curl -X POST http://localhost:3000/api/admin/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Veterinario",
    "description": "Acceso a gestión de especies",
    "permissions": ["<permission_id>"]
  }'
```

### Cambiar rol de usuario (requiere admin)
```bash
curl -X PATCH http://localhost:3000/api/admin/users/<user_id>/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"role": "<role_id>"}'
```

## Multi-tenancy

Cada usuario solo puede ver y gestionar sus propios terrarios y animales. Los administradores con el permiso `manage_all_terrariums` pueden acceder a todos los recursos.

## Arquitectura

```
src/
├── config/          # (eliminado - roles dinámicos en BD)
├── controllers/     # Lógica de negocio
├── middleware/      # Auth y permisos
├── models/          # Schemas de Mongoose
├── routes/          # Definición de rutas
├── index.js         # Entry point
└── seed.js          # Script de datos iniciales
```
