<template>
  <article 
    class="terrarium-card" 
    :class="{ 
      'terrarium-card--glass': terrarium.type === 'glass',
      'terrarium-card--standard': terrarium.type !== 'glass',
      'terrarium-card--warning': terrarium.hasCompatibilityIssue
    }"
    @click="goToDetail"
    role="button"
    tabindex="0"
    @keydown.enter="goToDetail"
    @keydown.space.prevent="goToDetail"
    aria-label="Ver detalles del terrario"
  >
    <!-- Efecto de brillo para terrarios de cristal -->
    <div v-if="terrarium.type === 'glass'" class="terrarium-card__shine"></div>

    <!-- Header: Nombre y acciones -->
    <header class="terrarium-card__header">
      <div class="header-info">
        <component 
          :is="getIcon(terrarium.type)" 
          class="type-icon" 
          :size="18" 
        />
        <h3 class="terrarium-name">{{ terrarium.name }}</h3>
      </div>
      <div class="header-actions">
        <!-- Alerta de compatibilidad -->
        <div
          v-if="terrarium.hasCompatibilityIssue"
          class="compatibility-alert"
          title="Problema de compatibilidad"
        >
          <AlertTriangleIcon :size="14" />
        </div>
        <!-- Menú de opciones (futuro) -->
        <button class="menu-btn" @click.stop aria-label="Opciones">
          <MoreVerticalIcon :size="20" />
        </button>
      </div>
    </header>

    <!-- Body: Habitantes (avatares) -->
    <div class="terrarium-card__body">
      <div v-if="terrarium.animals && terrarium.animals.length > 0" class="animals-grid">
        <div 
          v-for="animal in terrarium.animals.slice(0, 3)" 
          :key="animal._id" 
          class="animal-avatar"
          :class="{ 'has-image': animal.imageUrl }"
          :title="animal.name"
        >
          <img 
            v-if="animal.imageUrl" 
            :src="getImageUrl(animal.imageUrl)" 
            :alt="animal.name" 
            class="avatar-img"
          />
          <span v-else>{{ animal.name.charAt(0) }}</span>
        </div>
        <div v-if="terrarium.animals.length > 3" class="animal-avatar animal-avatar--more">
          +{{ terrarium.animals.length - 3 }}
        </div>
      </div>
      
      <div v-else class="empty-state">
        <span class="empty-text">Sin habitantes</span>
      </div>
    </div>

    <!-- Footer: Suelo con textura del bioma y sensores -->
    <footer 
      class="terrarium-card__footer"
      :style="getFooterStyle(terrarium.biome)"
    >
      <div class="footer-overlay"></div>
      
      <div class="sensor-badge">
        <ThermometerIcon :size="14" />
        <span>{{ terrarium.sensors?.temperature ?? '--' }}°C</span>
      </div>
      
      <div class="sensor-badge">
        <DropletIcon :size="14" />
        <span>{{ terrarium.sensors?.humidity ?? '--' }}%</span>
      </div>
    </footer>
  </article>
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
  MoreVerticalIcon
} from 'lucide-vue-next'
import { getImageUrl } from '../utils/image'

const props = defineProps<{
  terrarium: Terrarium
}>()

const router = useRouter()

// Mapa de texturas fotográficas por bioma
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

const goToDetail = () => {
  router.push(`/terrarium/${props.terrarium._id}`)
}

// Obtener el icono según el tipo de terrario
const getIcon = (type: string) => {
  return type === 'glass' ? SquareIcon : Grid3x3Icon
}

// Obtener estilo de textura para el footer según el bioma
// IMPORTANTE: background-position: center bottom para que siempre se vea el suelo
const getFooterStyle = (biome: string = 'tropical'): { backgroundImage: string; backgroundSize: string; backgroundPosition: string } => {
  const biomeConfig = biomeTextures[biome as keyof typeof biomeTextures] || biomeTextures.tropical
  
  return {
    backgroundImage: `url(${biomeConfig.url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center bottom' // Siempre mostrar el suelo, no el cielo
  }
}
</script>

<style scoped>
/* ============================================
   BLOQUE PRINCIPAL: Terrarium Card
   ============================================ */
.terrarium-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 280px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  /* Por defecto (Standard) */
  background: var(--color-surface);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: var(--shadow-sm);
}

.terrarium-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-float);
}

.terrarium-card:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Modificador: Glass (Modo Oscuro/Cristal Premium) */
.terrarium-card--glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  box-shadow: var(--shadow-float);
}

.terrarium-card--glass .terrarium-name {
  color: white;
}

.terrarium-card--glass .type-icon {
  color: rgba(255, 255, 255, 0.7);
}

/* Modificador: Warning (Problema de compatibilidad) */
.terrarium-card--warning {
  border-color: var(--color-accent);
  background-color: rgba(239, 108, 0, 0.05);
}

.terrarium-card--warning.terrarium-card--glass {
  background-color: rgba(239, 108, 0, 0.15);
}

/* ============================================
   ELEMENTO: Brillo del Cristal
   ============================================ */
.terrarium-card__shine {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(105deg, rgba(255, 255, 255, 0.05) 0%, transparent 40%);
  pointer-events: none;
  z-index: 1;
}

/* ============================================
   ELEMENTO: Header
   ============================================ */
.terrarium-card__header {
  position: relative;
  z-index: 2;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.terrarium-card--standard .terrarium-card__header {
  background-color: rgba(242, 241, 238, 0.5);
}

.terrarium-card--glass .terrarium-card__header {
  background-color: rgba(30, 41, 59, 0.3);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0; /* Permite que el texto se trunque */
}

.type-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.terrarium-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text-main);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.compatibility-alert {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(239, 108, 0, 0.2);
  border-radius: 9999px;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}

.menu-btn {
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.terrarium-card--glass .menu-btn {
  color: rgba(255, 255, 255, 0.7);
}

.terrarium-card--glass .menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* ============================================
   ELEMENTO: Body (Habitantes)
   ============================================ */
.terrarium-card__body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.25rem;
  position: relative;
  z-index: 2;
}

.animals-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: -0.5rem; /* Efecto de superposición */
  margin-left: -0.5rem; /* Compensar el gap negativo */
}

.animal-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border: 3px solid var(--color-surface);
  font-size: 1.2rem;
  box-shadow: var(--shadow-sm);
  margin-left: 0.5rem; /* Compensar el gap negativo */
  transition: transform var(--transition-base);
  overflow: hidden; /* Importante para recortar la imagen */
  padding: 0; /* Quitar padding para que la imagen toque los bordes */
  position: relative;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Ajuste para cuando NO hay imagen (centrar texto) */
.animal-avatar:not(.has-image) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.terrarium-card--glass .animal-avatar {
  border-color: #1e293b; /* Ajustar según el color de fondo glass */
  background: rgba(46, 125, 50, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.animal-avatar:hover {
  transform: scale(1.1);
  z-index: 3;
}

.animal-avatar--more {
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.terrarium-card--glass .animal-avatar--more {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-style: italic;
  opacity: 0.7;
}

.terrarium-card--glass .empty-text {
  color: rgba(255, 255, 255, 0.5);
}

/* ============================================
   ELEMENTO: Footer (Suelo con Bioma)
   ============================================ */
.terrarium-card__footer {
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-size: cover;
  /* IMPORTANTE: Posición bottom para ver el suelo */
  background-position: center bottom !important;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.terrarium-card--glass .terrarium-card__footer {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.footer-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2));
  z-index: 1;
  pointer-events: none;
}

.sensor-badge {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.sensor-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.sensor-badge svg {
  flex-shrink: 0;
}
</style>
