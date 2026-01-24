/**
 * Helper para obtener la URL completa de una imagen
 * Maneja imágenes locales y externas
 */

// URL base del backend (solo se usa si no hay proxy configurado)
// En desarrollo, Vite proxy redirige /public y /api al backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const USE_PROXY = import.meta.env.DEV // En desarrollo, usar proxy (rutas relativas)

/**
 * Obtiene la URL completa de una imagen
 * @param path - Ruta de la imagen (puede ser local o externa)
 * @returns URL completa de la imagen o placeholder por defecto
 */
export function getImageUrl(path: string | null | undefined): string {
  // Si no hay path, devolver placeholder
  if (!path) {
    return getPlaceholderImage()
  }

  // Si es una URL externa (http/https), devolverla tal cual
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Si es una ruta local (empieza con /uploads o /public)
  if (path.startsWith('/uploads') || path.startsWith('/public')) {
    // En desarrollo con proxy, usar ruta relativa
    // En producción, construir URL completa si es necesario
    if (USE_PROXY) {
      return path
    }
    return `${API_BASE_URL}${path}`
  }

  // Si es una ruta relativa que empieza con /
  if (path.startsWith('/')) {
    if (USE_PROXY) {
      return path
    }
    return `${API_BASE_URL}${path}`
  }

  // Si no coincide con ningún patrón, devolver placeholder
  return getPlaceholderImage()
}

/**
 * Obtiene una imagen placeholder por defecto
 * @returns URL de imagen placeholder
 */
function getPlaceholderImage(): string {
  // Puedes usar un servicio de placeholder o una imagen local
  // Por ejemplo: 'https://via.placeholder.com/300x300?text=Sin+Imagen'
  // O una imagen local en public/assets/placeholder.png
  return 'https://via.placeholder.com/300x300?text=Sin+Imagen'
}
