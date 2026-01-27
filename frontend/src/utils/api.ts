/**
 * Wrapper de fetch que intercepta errores 403 (Forbidden) y redirige al login
 * 
 * @param url - URL de la petición
 * @param options - Opciones de fetch (método, headers, body, etc.)
 * @returns Promise<Response>
 */
export async function apiFetch(
  url: string | URL,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options)

  // Si la respuesta es 403 (Forbidden), redirigir al login
  if (response.status === 403) {
    // Limpiar token del localStorage
    localStorage.removeItem('token')
    
    // Redirigir al login usando window.location para asegurar que funcione
    // incluso fuera del contexto de Vue Router
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    
    // Lanzar un error para que el código que llama pueda manejarlo
    throw new Error('Acceso denegado. Por favor, inicia sesión nuevamente.')
  }

  return response
}

