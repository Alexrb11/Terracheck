import { Router } from 'express'
import {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  moveAnimal
} from '../controllers/animal.controller.js'

const router = Router()

// GET /api/animals - Obtener todos los animales
router.get('/', getAllAnimals)

// GET /api/animals/:id - Obtener un animal por ID
router.get('/:id', getAnimalById)

// POST /api/animals - Crear un nuevo animal
router.post('/', createAnimal)

// PUT /api/animals/:id - Actualizar un animal
router.put('/:id', updateAnimal)

// DELETE /api/animals/:id - Eliminar un animal
router.delete('/:id', deleteAnimal)

// PUT /api/animals/:id/move - Mover animal a otro terrario
router.put('/:id/move', moveAnimal)

export default router
