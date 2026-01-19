# TerrariumKeeper Backend

API REST para la gestión de terrarios de reptiles con autenticación JWT.

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
3. Usar token en headers: `Authorization: Bearer <token>`

### Credenciales de prueba (después de ejecutar seed):
- **Email:** `admin@terracheck.com`
- **Password:** `123456`

## Endpoints API

### Auth (Públicas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Auth (Protegidas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/auth/me` | Obtener usuario actual |
| PUT | `/api/auth/me` | Actualizar perfil |
| PUT | `/api/auth/password` | Cambiar contraseña |

### Especies (Públicas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/species` | Lista todas las especies |
| GET | `/api/species/:id` | Obtiene una especie |
| POST | `/api/species` | Crea una especie |

### Terrarios (Protegidas - Multi-tenancy)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/terrariums` | Lista terrarios del usuario |
| GET | `/api/terrariums/:id` | Obtiene un terrario |
| POST | `/api/terrariums` | Crea un terrario |
| PUT | `/api/terrariums/:id` | Actualiza un terrario |
| DELETE | `/api/terrariums/:id` | Elimina un terrario |
| PUT | `/api/terrariums/:id/sensors` | Actualiza sensores |

### Animales (Protegidas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/animals` | Lista todos los animales |
| GET | `/api/animals/:id` | Obtiene un animal |
| POST | `/api/animals` | Crea un animal |
| PUT | `/api/animals/:id` | Actualiza un animal |
| DELETE | `/api/animals/:id` | Elimina un animal |
| PUT | `/api/animals/:id/move` | Mueve a otro terrario |

## Ejemplos de Uso

### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@example.com","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@terracheck.com","password":"123456"}'
```

### Obtener terrarios (con token)
```bash
curl http://localhost:3000/api/terrariums \
  -H "Authorization: Bearer <tu-token>"
```

### Crear terrario
```bash
curl -X POST http://localhost:3000/api/terrariums \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{"name":"Mi Terrario","dimensions":{"width":60,"depth":45,"height":45},"type":"glass"}'
```

## Multi-tenancy

El sistema implementa aislamiento por usuario:
- Cada usuario solo ve sus propios terrarios
- Los terrarios se asignan automáticamente al usuario que los crea
- Las operaciones verifican que el recurso pertenezca al usuario

## Validación de Compatibilidad

Al añadir o mover un animal a un terrario, el sistema verifica:

1. **Bioma**: Los animales deben ser del mismo bioma (Tropical, Arid, Temperate)
2. **Múltiples machos**: Detecta si hay más de un macho de la misma especie

Si hay incompatibilidad, devuelve error 400 con mensaje descriptivo.

## Estructura

```
backend/
├── src/
│   ├── controllers/     # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── animal.controller.js
│   │   ├── species.controller.js
│   │   └── terrarium.controller.js
│   ├── middleware/      # Middleware de autenticación
│   │   └── auth.middleware.js
│   ├── models/          # Schemas de Mongoose
│   │   ├── User.js
│   │   ├── Animal.js
│   │   ├── Species.js
│   │   └── Terrarium.js
│   ├── routes/          # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── animal.routes.js
│   │   ├── species.routes.js
│   │   └── terrarium.routes.js
│   ├── index.js         # Entry point
│   └── seed.js          # Script de datos iniciales
├── env.example
├── package.json
└── README.md
```

## Seguridad

- Passwords hasheados con bcrypt (salt rounds: 10)
- JWT con expiración de 30 días
- Verificación de propiedad en todas las operaciones CRUD
- Validación de datos con Mongoose
