# TerrariumKeeper Backend

API REST para la gestión de terrarios de reptiles.

## Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp env.example .env

# Editar .env con tu URI de MongoDB
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

## Endpoints API

### Especies
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/species` | Lista todas las especies |
| GET | `/api/species/:id` | Obtiene una especie |
| POST | `/api/species` | Crea una especie |

### Terrarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/terrariums` | Lista terrarios con animales |
| GET | `/api/terrariums/:id` | Obtiene un terrario |
| POST | `/api/terrariums` | Crea un terrario |
| PUT | `/api/terrariums/:id` | Actualiza un terrario |
| DELETE | `/api/terrariums/:id` | Elimina un terrario |
| PUT | `/api/terrariums/:id/sensors` | Actualiza sensores |

### Animales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/animals` | Lista todos los animales |
| GET | `/api/animals/:id` | Obtiene un animal |
| POST | `/api/animals` | Crea un animal |
| PUT | `/api/animals/:id` | Actualiza un animal |
| DELETE | `/api/animals/:id` | Elimina un animal |
| PUT | `/api/animals/:id/move` | Mueve a otro terrario |

## Validación de Compatibilidad

Al añadir o mover un animal a un terrario, el sistema verifica:

1. **Bioma**: Los animales deben ser del mismo bioma (Tropical, Arid, Temperate)
2. **Múltiples machos**: Detecta si hay más de un macho de la misma especie

Si hay incompatibilidad, devuelve error 400 con mensaje descriptivo.

## Estructura

```
backend/
├── src/
│   ├── controllers/    # Lógica de negocio
│   ├── models/         # Schemas de Mongoose
│   ├── routes/         # Definición de rutas
│   ├── index.js        # Entry point
│   └── seed.js         # Script de datos iniciales
├── .env.example
├── package.json
└── README.md
```
