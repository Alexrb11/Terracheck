import { Router } from 'express'
import {
  getAllSpecies,
  getSpeciesById,
  createSpecies
} from '../controllers/species.controller.js'

const router = Router()

// GET /api/species - Obtener todas las especies
router.get('/', getAllSpecies)

// GET /api/species/:id - Obtener una especie por ID
router.get('/:id', getSpeciesById)

// POST /api/species - Crear una nueva especie
router.post('/', createSpecies)

export default router
