# 🦎 TerrariumKeeper

Aplicación web para gestionar terrarios y comprobar la compatibilidad entre especies de reptiles.

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 🛠️ Tech Stack

- **Vue 3** - Framework con Composition API (`<script setup>`)
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos utilitarios
- **Pinia** - Gestión de estado
- **Vue Router** - Enrutamiento
- **Lucide Vue Next** - Iconos

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── Navigation.vue
│   └── TerrariumCard.vue
├── views/           # Vistas/páginas
│   ├── DashboardView.vue
│   ├── TerrariumDetailView.vue
│   └── AddTerrariumView.vue
├── stores/          # Stores de Pinia
│   └── terrarium.ts
├── router/          # Configuración de rutas
│   └── index.ts
├── App.vue          # Componente raíz
├── main.ts          # Punto de entrada
└── style.css        # Estilos globales (Tailwind)
```

## 🎨 Design System

### Colores
- **Fondo**: `bg-stone-50` (blanco roto cálido)
- **Primario**: `emerald-600` (verde bosque)
- **Acentos**: `amber-400` (advertencias)
- **Texto**: `slate-800` (gris oscuro)

### Tipografía
- Fuentes: Poppins y Nunito (Google Fonts)
- Tamaños grandes para legibilidad (`text-lg` para cuerpo)

### Componentes
- Bordes muy redondeados (`rounded-2xl`, `rounded-3xl`)
- Sombras suaves (`shadow-lg`)
- Efectos hover con escala (`hover:scale-105`)

## 📱 Características

- ✅ Dashboard con grid de terrarios
- ✅ Tarjetas de terrario con información visual
- ✅ Detección de problemas de compatibilidad
- ✅ Navegación responsive (móvil: bottom bar, desktop: top bar)
- ✅ Vista de detalles de terrario
- ✅ Formulario para agregar nuevos terrarios
- ✅ Mock data inicial con 3 terrarios de ejemplo

## 🎯 Próximas Mejoras

- [ ] Vista de especies y compatibilidad
- [ ] Sistema de alertas y notificaciones
- [ ] Gráficos de temperatura y humedad
- [ ] Modo oscuro
- [ ] Persistencia de datos (localStorage o backend)
