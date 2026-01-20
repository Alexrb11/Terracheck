<template>
  <div
    :class="[
      'terrarium-card',
      terrarium.hasCompatibilityIssue && 'terrarium-card--warning',
      terrarium.type === 'glass' && 'terrarium-card--glass',
      terrarium.type !== 'glass' && 'terrarium-card--standard'
    ]"
    @click="handleClick"
    role="button"
    tabindex="0"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    aria-label="Ver detalles del terrario"
  >
    <!-- Efecto Glass: Gradiente overlay para simular reflejo de luz -->
    <div 
      v-if="terrarium.type === 'glass'"
      class="terrarium-card__glass-overlay"
    ></div>

    <!-- La "Tapa" (Header) -->
    <div class="terrarium-card__header">
      <h3 class="terrarium-card__title">{{ terrarium.name }}</h3>
      <div class="terrarium-card__header-actions">
        <!-- Alerta de compatibilidad -->
        <div
          v-if="terrarium.hasCompatibilityIssue"
          class="terrarium-card__alert"
          title="Problema de compatibilidad"
        >
          <AlertTriangleIcon :size="14" />
        </div>
        <!-- Icono de tipo -->
        <component
          :is="terrarium.type === 'glass' ? SquareIcon : Grid3x3Icon"
          :size="18"
          class="terrarium-card__type-icon"
        />
      </div>
    </div>

    <!-- Contenido Principal (Los "Habitantes") -->
    <div class="terrarium-card__content">
      <!-- Animales como avatares flotantes -->
      <div v-if="terrarium.animals && terrarium.animals.length > 0" class="terrarium-card__animals">
        <div
          v-for="animal in terrarium.animals"
          :key="animal._id"
          class="terrarium-card__animal-avatar"
        >
          <div class="terrarium-card__avatar-circle">
            <span class="terrarium-card__avatar-letter">
              {{ animal.name.charAt(0) }}
            </span>
          </div>
          <!-- Tooltip con nombre -->
          <div class="terrarium-card__tooltip">
            {{ animal.name }}
            <div class="terrarium-card__tooltip-arrow"></div>
          </div>
        </div>
      </div>
      
      <!-- Estado vacío -->
      <div v-else class="terrarium-card__empty">
        <div class="terrarium-card__empty-icon">
          <PawPrintIcon :size="24" />
        </div>
        <p class="terrarium-card__empty-text">Sin habitantes</p>
      </div>

      <!-- Dimensiones discretas en el centro -->
      <div class="terrarium-card__dimensions">
        <RulerIcon :size="12" />
        <span>{{ terrarium.dimensions.width }}×{{ terrarium.dimensions.depth }}×{{ terrarium.dimensions.height }}cm</span>
        <span v-if="terrarium.liters" class="terrarium-card__liters">· {{ terrarium.liters }}L</span>
      </div>
    </div>

    <!-- El "Suelo" (Footer con Sensores como Termómetros Digitales) -->
    <div
      :style="getBiomeTextureStyle()"
      :class="[
        'terrarium-card__footer',
        `terrarium-card__footer--${terrarium.biome || 'tropical'}`
      ]"
    >
      <!-- Overlay degradado para mejorar legibilidad del texto sobre la imagen -->
      <div class="terrarium-card__footer-overlay"></div>
      
      <!-- Contenido de los sensores (sobre el overlay) -->
      <div class="terrarium-card__sensors">
        <!-- Sensor de Temperatura (Termómetro Digital) -->
        <div class="terrarium-card__sensor">
          <ThermometerIcon :size="16" />
          <div class="terrarium-card__sensor-content">
            <span class="terrarium-card__sensor-label">Temp</span>
            <span class="terrarium-card__sensor-value terrarium-card__sensor-value--temp">
              {{ terrarium.sensors?.temperature ?? '--' }}°C
            </span>
          </div>
        </div>

        <!-- Sensor de Humedad (Termómetro Digital) -->
        <div class="terrarium-card__sensor">
          <DropletIcon :size="16" />
          <div class="terrarium-card__sensor-content">
            <span class="terrarium-card__sensor-label">Hum</span>
            <span class="terrarium-card__sensor-value terrarium-card__sensor-value--hum">
              {{ terrarium.sensors?.humidity ?? '--' }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Efecto de brillo al hover -->
    <div class="terrarium-card__hover-effect"></div>
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

// Mapa de texturas fotográficas por bioma - FIX: Siempre usar center bottom para ver el suelo
const biomeTextures = {
  desert: {
    url: '/images/sand-footer.png'
  },
  tropical: {
    url: '/images/tropical-footer.png'
  },
  temperate: {
    url: '/images/forest-footer.png'
  }
}

const handleClick = () => {
  router.push(`/terrarium/${props.terrarium._id}`)
}

// Obtener estilo de textura para el footer según el bioma
// FIX: background-position: center bottom para que siempre se vea el suelo
const getBiomeTextureStyle = (): { backgroundImage: string; backgroundSize: string; backgroundPosition: string } => {
  const biome = props.terrarium.biome || 'tropical'
  const biomeConfig = biomeTextures[biome] || biomeTextures.tropical
  
  return {
    backgroundImage: `url(${biomeConfig.url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center bottom' // Siempre mostrar el suelo, no el cielo
  }
}
</script>

<style scoped>
/* Tarjeta base */
.terrarium-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 256px;
  border: 1px solid;
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
  cursor: pointer;
  overflow: hidden;
}

.terrarium-card:hover {
  transform: translateY(-4px);
}

.terrarium-card:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Modo Estándar */
.terrarium-card--standard {
  background-color: var(--color-surface);
  border-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-main);
  box-shadow: var(--shadow-sm);
}

.terrarium-card--standard:hover {
  box-shadow: var(--shadow-md);
}

/* Modo Glass (Glassmorphism) */
.terrarium-card--glass {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: var(--shadow-float);
}

.terrarium-card--glass .terrarium-card__glass-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), transparent);
  pointer-events: none;
  z-index: 0;
}

/* Modo Warning */
.terrarium-card--warning {
  border-color: var(--color-accent);
  background-color: rgba(239, 108, 0, 0.1);
}

/* Header */
.terrarium-card__header {
  position: relative;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
}

.terrarium-card--standard .terrarium-card__header {
  background-color: rgba(242, 241, 238, 0.5);
}

.terrarium-card--glass .terrarium-card__header {
  background-color: rgba(30, 41, 59, 0.3);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.terrarium-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terrarium-card__header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.terrarium-card__alert {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(239, 108, 0, 0.2);
  border-radius: 9999px;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}

.terrarium-card__type-icon {
  color: var(--color-text-muted);
}

.terrarium-card--glass .terrarium-card__type-icon {
  color: rgba(255, 255, 255, 0.8);
}

/* Contenido */
.terrarium-card__content {
  flex: 1;
  position: relative;
  z-index: 20;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  overflow: hidden;
}

.terrarium-card__animals {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.terrarium-card__animal-avatar {
  position: relative;
}

.terrarium-card__animal-avatar:hover .terrarium-card__tooltip {
  opacity: 1;
}

.terrarium-card__avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, #4ade80, var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: transform var(--transition-base);
}

.terrarium-card__animal-avatar:hover .terrarium-card__avatar-circle {
  transform: scale(1.1);
}

.terrarium-card__avatar-letter {
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
}

.terrarium-card__tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #1e293b;
  color: white;
  font-size: 0.75rem;
  border-radius: var(--radius-md);
  opacity: 0;
  transition: opacity var(--transition-fast);
  pointer-events: none;
  white-space: nowrap;
  z-index: 30;
}

.terrarium-card__tooltip-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1e293b;
}

.terrarium-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
}

.terrarium-card--glass .terrarium-card__empty {
  color: rgba(255, 255, 255, 0.7);
}

.terrarium-card__empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background-color: rgba(242, 241, 238, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.terrarium-card--glass .terrarium-card__empty-icon {
  background-color: rgba(255, 255, 255, 0.1);
}

.terrarium-card__empty-text {
  font-size: 0.75rem;
  font-style: italic;
}

.terrarium-card__dimensions {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
  color: var(--color-text-muted);
  background-color: rgba(255, 255, 255, 0.3);
}

.terrarium-card--glass .terrarium-card__dimensions {
  color: rgba(255, 255, 255, 0.7);
  background-color: rgba(255, 255, 255, 0.1);
}

.terrarium-card__liters {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.terrarium-card--glass .terrarium-card__liters {
  color: rgba(255, 255, 255, 0.5);
}

/* Footer con textura - FIX DE IMÁGENES */
.terrarium-card__footer {
  position: relative;
  z-index: 20;
  margin-top: auto;
  padding: 1rem;
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  display: flex;
  justify-content: space-around;
  align-items: center;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  /* FIX: background-position siempre center bottom para ver el suelo */
  background-position: center bottom !important;
  background-size: cover !important;
}

.terrarium-card--glass .terrarium-card__footer {
  border-top-color: rgba(255, 255, 255, 0.2);
}

/* Overlay degradado para legibilidad del texto sobre la imagen */
.terrarium-card__footer-overlay {
  position: absolute;
  inset: 0;
  /* Gradiente lineal de arriba (transparente) a abajo (oscuro) para legibilidad */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
  pointer-events: none;
}

.terrarium-card__sensors {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.terrarium-card__sensor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(30, 41, 59, 0.9);
  border-radius: 9999px;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(51, 65, 85, 0.5);
  backdrop-filter: blur(4px);
}

.terrarium-card__sensor-content {
  display: flex;
  flex-direction: column;
}

.terrarium-card__sensor-label {
  font-size: 10px;
  color: rgba(203, 213, 225, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

.terrarium-card__sensor-value {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.terrarium-card__sensor-value--temp {
  color: #fcd34d;
}

.terrarium-card__sensor-value--hum {
  color: #7dd3fc;
}

/* Efecto hover */
.terrarium-card__hover-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, transparent, rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
  z-index: 15;
}

.terrarium-card:hover .terrarium-card__hover-effect {
  opacity: 1;
}
</style>
