import { Router } from 'express'
import {
  getAllTerrariums,
  getTerrariumById,
  createTerrarium,
  updateTerrarium,
  deleteTerrarium,
  updateSensors
} from '../controllers/terrarium.controller.js'

const router = Router()

// GET /api/terrariums - Obtener todos los terrarios
router.get('/', getAllTerrariums)

// GET /api/terrariums/:id - Obtener un terrario por ID
router.get('/:id', getTerrariumById)

// POST /api/terrariums - Crear un nuevo terrario
router.post('/', createTerrarium)

// PUT /api/terrariums/:id - Actualizar un terrario
router.put('/:id', updateTerrarium)

// DELETE /api/terrariums/:id - Eliminar un terrario
router.delete('/:id', deleteTerrarium)

// PUT /api/terrariums/:id/sensors - Actualizar sensores
router.put('/:id/sensors', updateSensors)

export default router
