import { Router } from 'express'
import {
  getAllPermissions,
  createPermission,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from '../controllers/role.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { checkPermission } from '../middleware/checkPermission.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(protect)

// ============== PERMISOS ==============
// GET /api/admin/roles/permissions - Lista todos los permisos
router.get('/permissions', checkPermission('manage_roles'), getAllPermissions)

// POST /api/admin/roles/permissions - Crea un nuevo permiso
router.post('/permissions', checkPermission('manage_roles'), createPermission)

// ============== ROLES ==============
// GET /api/admin/roles - Lista todos los roles
router.get('/', checkPermission('manage_roles'), getAllRoles)

// GET /api/admin/roles/:id - Obtiene un rol específico
router.get('/:id', checkPermission('manage_roles'), getRoleById)

// POST /api/admin/roles - Crea un nuevo rol
router.post('/', checkPermission('manage_roles'), createRole)

// PUT /api/admin/roles/:id - Actualiza un rol
router.put('/:id', checkPermission('manage_roles'), updateRole)

// DELETE /api/admin/roles/:id - Elimina un rol
router.delete('/:id', checkPermission('manage_roles'), deleteRole)

export default router
