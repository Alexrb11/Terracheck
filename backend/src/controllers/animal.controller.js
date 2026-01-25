import Animal from '../models/Animal.js'
import Species from '../models/Species.js'
import Terrarium from '../models/Terrarium.js'
import User from '../models/User.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const hasPermission = async (resource, user) => {
  if (resource.user && resource.user.toString() === user._id.toString()) {
    return true
  }

  let userWithRole = user
  if (!user.role || typeof user.role === 'object' && !user.role.slug) {
    userWithRole = await User.findById(user._id).populate('role', 'slug')
  }

  const roleSlug = userWithRole.role?.slug || (typeof userWithRole.role === 'object' ? userWithRole.role.slug : null)
  
  if (roleSlug === 'admin' || roleSlug === 'super_admin') {
    return true
  }

  return false
}

// GET /api/animals - Obtener todos los animales
export const getAllAnimals = async (req, res) => {
  try {
    const { terrarium, species } = req.query

    let userWithRole = req.user
    if (!req.user.role || typeof req.user.role === 'object' && !req.user.role.slug) {
      userWithRole = await User.findById(req.user._id).populate('role', 'slug')
    }
    const roleSlug = userWithRole.role?.slug || (typeof userWithRole.role === 'object' ? userWithRole.role.slug : null)
    const isAdmin = roleSlug === 'admin' || roleSlug === 'super_admin'

    let query = { isActive: true }

    if (!isAdmin) {
      query.user = req.user._id
    }

    if (terrarium) {
      query.terrarium = terrarium
    }

    if (species) {
      query.species = species
    }

    const animals = await Animal.find(query)
      .populate('species', 'commonName scientificName biome')
      .populate('terrarium', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: animals.length,
      data: animals
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener animales',
      error: error.message
    })
  }
}

// GET /api/animals/mine - Obtener todos los animales del usuario autenticado
export const getMyAnimals = async (req, res) => {
  try {
    const animals = await Animal.find({
      user: req.user._id,
      isActive: true
    })
      .populate('species', 'commonName scientificName biome')
      .populate('terrarium', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: animals.length,
      data: animals
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener mis animales',
      error: error.message
    })
  }
}

// GET /api/animals/:id - Obtener un animal por ID
export const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('species', 'commonName scientificName biome parameters imageUrl description')
      .populate('terrarium', 'name type biome dimensions')

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    if (!await hasPermission(animal, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este animal'
      })
    }

    if (!animal.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    res.json({
      success: true,
      data: animal
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el animal',
      error: error.message
    })
  }
}

// POST /api/animals - Crear un nuevo animal
export const createAnimal = async (req, res) => {
  try {
    const { name, birthDate, sex, species: speciesId, terrarium: terrariumId, weight, notes } = req.body

    const speciesDoc = await Species.findById(speciesId)
    if (!speciesDoc) {
      return res.status(400).json({
        success: false,
        message: 'La especie especificada no existe'
      })
    }

    if (terrariumId) {
      const compatibilityCheck = await checkBiomeCompatibility(terrariumId, speciesDoc.biome)

      if (!compatibilityCheck.compatible) {
        return res.status(400).json({
          success: false,
          message: 'Incompatibilidad de Bioma',
          details: compatibilityCheck.details,
          warning: true
        })
      }
    }

    const animal = await Animal.create({
      user: req.user._id,
      name,
      birthDate,
      sex,
      species: speciesId,
      terrarium: terrariumId || null,
      weight,
      notes
    })

    await animal.populate('species', 'commonName scientificName biome')
    await animal.populate('terrarium', 'name')

    res.status(201).json({
      success: true,
      message: 'Animal añadido exitosamente',
      data: animal
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear el animal',
      error: error.message
    })
  }
}

// PUT /api/animals/:id - Actualizar un animal
export const updateAnimal = async (req, res) => {
  try {
    const { species: newSpeciesId } = req.body

    const currentAnimal = await Animal.findById(req.params.id).populate('species')

    if (!currentAnimal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    if (!await hasPermission(currentAnimal, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este animal'
      })
    }

    if (!currentAnimal.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    if (req.body.terrarium !== undefined) {
      const newTerrariumId = req.body.terrarium
      
      if (newTerrariumId) {
        const newTerrarium = await Terrarium.findById(newTerrariumId)

        if (!newTerrarium) {
          return res.status(404).json({
            success: false,
            message: 'El terrario especificado no existe'
          })
        }

        if (!await hasPermission(newTerrarium, req.user)) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para usar este terrario'
          })
        }

        let biomeToCheck

        if (newSpeciesId) {
          const speciesDoc = await Species.findById(newSpeciesId)
          if (!speciesDoc) {
            return res.status(400).json({
              success: false,
              message: 'La especie especificada no existe'
            })
          }
          biomeToCheck = speciesDoc.biome
        } else {
          biomeToCheck = currentAnimal.species?.biome
        }

        if (biomeToCheck) {
          await checkBiomeCompatibility(
            newTerrariumId,
            biomeToCheck,
            req.params.id
          )
        }
      }
    }
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('species', 'commonName scientificName biome')
      .populate('terrarium', 'name')

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Animal actualizado exitosamente',
      data: animal
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el animal',
      error: error.message
    })
  }
}

// DELETE /api/animals/:id - Eliminar un animal (soft delete)
export const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    if (!await hasPermission(animal, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este animal'
      })
    }

    animal.isActive = false
    animal.terrarium = null
    await animal.save()

    res.json({
      success: true,
      message: 'Animal eliminado exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el animal',
      error: error.message
    })
  }
}

// PUT /api/animals/:id/move - Mover animal a otro terrario
export const moveAnimal = async (req, res) => {
  try {
    const { terrariumId } = req.body

    const animal = await Animal.findById(req.params.id).populate('species')

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    if (!await hasPermission(animal, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para mover este animal'
      })
    }

    if (terrariumId) {
      await checkBiomeCompatibility(
        terrariumId,
        animal.species.biome,
        animal._id.toString()
      )
    }

    animal.terrarium = terrariumId || null
    await animal.save()

    await animal.populate('terrarium', 'name')

    res.json({
      success: true,
      message: terrariumId ? 'Animal movido exitosamente' : 'Animal removido del terrario',
      data: animal
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al mover el animal',
      error: error.message
    })
  }
}

async function checkBiomeCompatibility(terrariumId, newAnimalBiome, excludeAnimalId = null) {
  let query = {
    terrarium: terrariumId,
    isActive: true
  }

  if (excludeAnimalId) {
    query._id = { $ne: excludeAnimalId }
  }

  const existingAnimals = await Animal.find(query).populate('species', 'biome commonName')

  if (existingAnimals.length === 0) {
    return { compatible: true }
  }

  const existingBiomes = [...new Set(existingAnimals.map(a => a.species?.biome).filter(Boolean))]

  if (existingBiomes.length === 0) {
    return { compatible: true }
  }

  if (existingBiomes.includes(newAnimalBiome)) {
    return { compatible: true }
  }

  return {
    compatible: false,
    details: {
      newBiome: newAnimalBiome,
      existingBiomes: existingBiomes,
      existingAnimals: existingAnimals.map(a => ({
        name: a.name,
        species: a.species?.commonName,
        biome: a.species?.biome
      }))
    }
  }
}

// PUT /api/animals/:id/profile-image - Actualizar imagen de perfil
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      })
    }

    const animal = await Animal.findById(req.params.id)

    if (!animal) {
      const filePath = path.join(__dirname, '../../public/uploads/animals', req.file.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    if (!await hasPermission(animal, req.user)) {
      const filePath = path.join(__dirname, '../../public/uploads/animals', req.file.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este animal'
      })
    }

    if (animal.imageUrl && !animal.imageUrl.startsWith('http')) {
      const oldImagePath = animal.imageUrl.replace('/uploads', '').replace('/public', '')
      const fullOldPath = path.join(__dirname, '../../public', oldImagePath)
      
      if (fs.existsSync(fullOldPath)) {
        try {
          fs.unlinkSync(fullOldPath)
        } catch (error) {
          console.error('Error al eliminar imagen anterior:', error.message)
        }
      }
    }

    const imageUrl = `/uploads/animals/${req.file.filename}`
    animal.imageUrl = imageUrl
    await animal.save()

    res.json({
      success: true,
      message: 'Imagen de perfil actualizada exitosamente',
      data: {
        imageUrl: animal.imageUrl
      }
    })
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '../../public/uploads/animals', req.file.filename)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (unlinkError) {
          console.error('Error al eliminar archivo subido:', unlinkError.message)
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar la imagen de perfil',
      error: error.message
    })
  }
}

// POST /api/animals/:id/gallery - Añadir imágenes a la galería
export const addToGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron imágenes'
      })
    }

    const animal = await Animal.findById(req.params.id)

    if (!animal) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../../public/uploads/animals', file.filename)
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath)
          } catch (error) {
            console.error('Error al eliminar archivo:', error.message)
          }
        }
      })
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    if (!await hasPermission(animal, req.user)) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../../public/uploads/animals', file.filename)
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath)
          } catch (error) {
            console.error('Error al eliminar archivo:', error.message)
          }
        }
      })
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este animal'
      })
    }

    const newImageUrls = req.files.map(file => `/uploads/animals/${file.filename}`)
    animal.gallery = [...(animal.gallery || []), ...newImageUrls]
    await animal.save()

    res.json({
      success: true,
      message: `${req.files.length} imagen(es) añadida(s) a la galería exitosamente`,
      data: {
        gallery: animal.gallery
      }
    })
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../../public/uploads/animals', file.filename)
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath)
          } catch (unlinkError) {
            console.error('Error al eliminar archivo:', unlinkError.message)
          }
        }
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error al añadir imágenes a la galería',
      error: error.message
    })
  }
}

// DELETE /api/animals/:id/gallery - Eliminar imagen de la galería
export const removeFromGallery = async (req, res) => {
  try {
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere la URL de la imagen a eliminar'
      })
    }

    const animal = await Animal.findById(req.params.id)

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

    if (!await hasPermission(animal, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este animal'
      })
    }

    if (!animal.gallery || !animal.gallery.includes(imageUrl)) {
      return res.status(404).json({
        success: false,
        message: 'La imagen no se encuentra en la galería'
      })
    }

    animal.gallery = animal.gallery.filter(url => url !== imageUrl)
    await animal.save()

    if (!imageUrl.startsWith('http')) {
      const imagePath = imageUrl.replace('/uploads', '').replace('/public', '')
      const fullPath = path.join(__dirname, '../../public', imagePath)
      
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath)
        } catch (error) {
          console.error('Error al eliminar archivo físico:', error.message)
        }
      }
    }

    res.json({
      success: true,
      message: 'Imagen eliminada de la galería exitosamente',
      data: {
        gallery: animal.gallery
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen de la galería',
      error: error.message
    })
  }
}
