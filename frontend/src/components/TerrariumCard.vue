<template>
  <div
    :class="[
      'group relative flex flex-col justify-between h-64 border-2 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden',
      terrarium.hasCompatibilityIssue ? 'border-red-300/60' : getBiomeBorder(),
      getBiomeBackground(),
      terrarium.type === 'glass' ? 'backdrop-blur-md' : ''
    ]"
    @click="handleClick"
    role="button"
    tabindex="0"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    aria-label="Ver detalles del terrario"
  >
    <!-- Efecto Cristal: Reflejo superior (más pronunciado si es glass) -->
    <div 
      :class="[
        'absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl rounded-tr-3xl pointer-events-none z-10',
        terrarium.type === 'glass' 
          ? 'from-white/60 to-transparent' 
          : 'from-white/40 to-transparent'
      ]"
    ></div>
    
    <!-- Efecto Cristal: Gradiente de fondo (más transparente si es glass) -->
    <div 
      :class="[
        'absolute inset-0 bg-gradient-to-b backdrop-blur-sm pointer-events-none z-0',
        terrarium.type === 'glass'
          ? 'from-white/60 to-stone-50/60'
          : 'from-white/80 to-stone-50/80'
      ]"
    ></div>

    <!-- Efecto Cristal adicional: Reflejos laterales (solo para glass) -->
    <div 
      v-if="terrarium.type === 'glass'"
      class="absolute inset-0 pointer-events-none z-5"
    >
      <!-- Reflejo izquierdo -->
      <div class="absolute left-0 top-1/4 bottom-1/4 w-1/3 bg-gradient-to-r from-white/20 to-transparent rounded-l-3xl"></div>
      <!-- Reflejo derecho -->
      <div class="absolute right-0 top-1/3 bottom-1/3 w-1/4 bg-gradient-to-l from-white/15 to-transparent rounded-r-3xl"></div>
    </div>

    <!-- La "Tapa" (Header) -->
    <div class="relative z-20 flex justify-between items-center p-3 bg-stone-100/50 backdrop-blur-md border-b border-stone-200/50">
      <h3 class="text-lg font-bold text-slate-800 truncate flex-1">{{ terrarium.name }}</h3>
      <div class="flex items-center gap-2 ml-2 flex-shrink-0">
        <!-- Alerta de compatibilidad -->
        <div
          v-if="terrarium.hasCompatibilityIssue"
          class="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full border border-red-300/50"
          title="Problema de compatibilidad"
        >
          <AlertTriangleIcon :size="14" class="text-red-600" />
        </div>
        <!-- Icono de tipo -->
        <component
          :is="terrarium.type === 'glass' ? SquareIcon : Grid3x3Icon"
          :size="18"
          class="text-slate-600"
        />
      </div>
    </div>

    <!-- Contenido Principal (Los "Habitantes") -->
    <div class="flex-1 relative z-20 p-4 flex flex-col items-center justify-center gap-3 overflow-hidden">
      <!-- Animales como avatares flotantes -->
      <div v-if="terrarium.animals && terrarium.animals.length > 0" class="flex flex-wrap items-center justify-center gap-3">
        <div
          v-for="animal in terrarium.animals"
          :key="animal._id"
          class="relative group/avatar"
        >
          <div
            class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg border-2 border-white/50 transition-transform duration-300 group-hover/avatar:scale-110"
          >
            <span class="text-white font-bold text-lg">
              {{ animal.name.charAt(0) }}
            </span>
          </div>
          <!-- Tooltip con nombre -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
            {{ animal.name }}
            <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      </div>
      
      <!-- Estado vacío -->
      <div v-else class="flex flex-col items-center justify-center gap-2 text-slate-400">
        <div class="w-16 h-16 rounded-full bg-stone-200/50 flex items-center justify-center">
          <PawPrintIcon :size="24" class="text-stone-400" />
        </div>
        <p class="text-xs italic">Sin habitantes</p>
      </div>

      <!-- Dimensiones discretas en el centro -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-slate-500/70 bg-white/30 px-2 py-1 rounded-full backdrop-blur-sm">
        <RulerIcon :size="12" />
        <span>{{ terrarium.dimensions.width }}×{{ terrarium.dimensions.depth }}×{{ terrarium.dimensions.height }}cm</span>
        <span v-if="terrarium.liters" class="text-slate-400">· {{ terrarium.liters }}L</span>
      </div>
    </div>

    <!-- El "Suelo" (Footer con Sensores como Termómetros Digitales) -->
    <div
      :style="getBiomeTextureStyle()"
      :class="[
        'relative z-20 mt-auto p-3 backdrop-blur-sm border-t rounded-b-3xl flex justify-around items-center overflow-hidden shadow-inner',
        getBiomeFooterBorder()
      ]"
    >
      <!-- Overlay oscuro para mejorar contraste del texto -->
      <div class="absolute inset-0 bg-black/30 pointer-events-none"></div>
      
      <!-- Contenido de los sensores (sobre el overlay) -->
      <div class="relative z-10 flex justify-around items-center w-full">
        <!-- Sensor de Temperatura (Termómetro Digital) -->
        <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 rounded-full shadow-lg border border-slate-700/50 backdrop-blur-sm">
          <ThermometerIcon :size="16" class="text-amber-300 flex-shrink-0" />
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-300 uppercase tracking-wide leading-none">Temp</span>
            <span class="text-sm font-bold text-amber-300 leading-tight drop-shadow-lg">
              {{ terrarium.sensors?.temperature ?? '--' }}°C
            </span>
          </div>
        </div>

        <!-- Sensor de Humedad (Termómetro Digital) -->
        <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 rounded-full shadow-lg border border-slate-700/50 backdrop-blur-sm">
          <DropletIcon :size="16" class="text-sky-300 flex-shrink-0" />
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-300 uppercase tracking-wide leading-none">Hum</span>
            <span class="text-sm font-bold text-sky-300 leading-tight drop-shadow-lg">
              {{ terrarium.sensors?.humidity ?? '--' }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Efecto de brillo al hover (más intenso si es glass) -->
    <div 
      :class="[
        'absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-15',
        terrarium.type === 'glass'
          ? 'from-white/0 via-white/10 to-white/30'
          : 'from-white/0 via-white/0 to-white/20'
      ]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Terrarium } from '@/stores/terrarium'
import { useRouter } from 'vue-router'
import {
  SquareIcon,
  Grid3x3Icon,
  AlertTriangleIcon,
  ThermometerIcon,
  DropletIcon,
  RulerIcon,
  PawPrintIcon
} from 'lucide-vue-next'

const props = defineProps<{
  terrarium: Terrarium
}>()

const router = useRouter()

// Mapa de texturas fotográficas por bioma con configuración de posición
// Las imágenes están en la carpeta public/images/ y se acceden desde /images/
const biomeTextures = {
  desert: {
    url: '/images/sand-footer.png',
    position: 'bottom center' // Forzar que se vea la arena de abajo
  },
  tropical: {
    url: '/images/tropical-footer.png',
    position: 'center center' // Se ve bien centrado
  },
  temperate: {
    url: '/images/forest-footer.png',
    position: 'bottom center' // Por si acaso es un paisaje con cielo
  }
}

const handleClick = () => {
  router.push(`/terrarium/${props.terrarium._id}`)
}

// Determinar color de fondo según el bioma del terrario
const getBiomeBackground = (): string => {
  if (props.terrarium.hasCompatibilityIssue) {
    return 'bg-red-50/30'
  }
  
  const biome = props.terrarium.biome
  if (biome === 'tropical') {
    return 'bg-emerald-50/20'
  } else if (biome === 'desert') {
    return 'bg-amber-50/20'
  } else if (biome === 'temperate') {
    return 'bg-blue-50/20'
  }
  
  // Color neutro por defecto
  return 'bg-stone-50/30'
}

// Determinar color del borde según el bioma y tipo
const getBiomeBorder = (): string => {
  if (props.terrarium.hasCompatibilityIssue) {
    return 'border-red-300/60'
  }
  
  // Si es glass, añadir un borde más brillante y translúcido
  const isGlass = props.terrarium.type === 'glass'
  const glassEffect = isGlass ? 'border-sky-200/70 shadow-[0_0_20px_rgba(56,189,248,0.2)]' : ''
  
  const biome = props.terrarium.biome
  let biomeBorder = ''
  
  if (biome === 'tropical') {
    biomeBorder = isGlass ? 'border-emerald-200/70' : 'border-emerald-200/50'
  } else if (biome === 'desert') {
    biomeBorder = isGlass ? 'border-amber-200/70' : 'border-amber-200/50'
  } else if (biome === 'temperate') {
    biomeBorder = isGlass ? 'border-stone-200/70' : 'border-stone-200/50'
  } else {
    biomeBorder = isGlass ? 'border-sky-200/70' : 'border-sky-100/50'
  }
  
  return `${biomeBorder} ${glassEffect}`.trim()
}

// Obtener estilo de textura para el footer según el bioma
const getBiomeTextureStyle = (): { backgroundImage: string; backgroundSize: string; backgroundPosition: string } => {
  const biome = props.terrarium.biome || 'tropical'
  const biomeConfig = biomeTextures[biome] || biomeTextures.tropical
  
  return {
    backgroundImage: `url(${biomeConfig.url})`,
    backgroundSize: 'cover',
    backgroundPosition: biomeConfig.position
  }
}

// Determinar color del borde del footer según el bioma
const getBiomeFooterBorder = (): string => {
  const biome = props.terrarium.biome
  if (biome === 'tropical') {
    return 'border-emerald-200/50'
  } else if (biome === 'desert') {
    return 'border-amber-200/50'
  } else if (biome === 'temperate') {
    return 'border-stone-200/50'
  }
  
  return 'border-stone-200/50'
}
</script>
