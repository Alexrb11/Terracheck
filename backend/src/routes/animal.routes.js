import { Router } from 'express'
import {
  getAllAnimals,
  getMyAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  moveAnimal,
  updateProfileImage,
  addToGallery,
  removeFromGallery
} from '../controllers/animal.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import upload from '../config/storage.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(protect)

// GET /api/animals - Obtener todos los animales
router.get('/', getAllAnimals)

// GET /api/animals/mine - Obtener todos los animales del usuario autenticado
router.get('/mine', getMyAnimals)

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

// PUT /api/animals/:id/profile-image - Actualizar imagen de perfil
router.put('/:id/profile-image', upload.single('image'), updateProfileImage)

// POST /api/animals/:id/gallery - Añadir imágenes a la galería
router.post('/:id/gallery', upload.array('images', 5), addToGallery)

// PUT /api/animals/:id/gallery/remove - Eliminar imagen de la galería
router.put('/:id/gallery/remove', removeFromGallery)

export default router
