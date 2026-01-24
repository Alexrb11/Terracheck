import Animal from '../models/Animal.js'
import Species from '../models/Species.js'
import Terrarium from '../models/Terrarium.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// GET /api/animals - Obtener todos los animales
export const getAllAnimals = async (req, res) => {
  try {
    const { terrarium, species } = req.query

    let query = { isActive: true }

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
    // Buscar todos los terrarios del usuario
    const terrariums = await Terrarium.find({ 
      user: req.user._id,
      isActive: true 
    }).select('_id')

    const terrariumIds = terrariums.map(t => t._id)

    // Buscar todos los animales que estén en esos terrarios
    const animals = await Animal.find({
      terrarium: { $in: terrariumIds },
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
    // Buscar todos los terrarios del usuario para verificar propiedad
    const terrariums = await Terrarium.find({ 
      user: req.user._id,
      isActive: true 
    }).select('_id')

    const terrariumIds = terrariums.map(t => t._id)

    // Buscar el animal y verificar que esté en uno de los terrarios del usuario
    const animal = await Animal.findOne({
      _id: req.params.id,
      terrarium: { $in: terrariumIds },
      isActive: true
    })
      .populate('species', 'commonName scientificName biome parameters imageUrl description')
      .populate('terrarium', 'name type biome dimensions sensors')

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado o no tienes permisos para verlo'
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

    // Verificar que la especie existe
    const speciesDoc = await Species.findById(speciesId)
    if (!speciesDoc) {
      return res.status(400).json({
        success: false,
        message: 'La especie especificada no existe'
      })
    }

    // Si se asigna a un terrario, verificar compatibilidad
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
      name,
      birthDate,
      sex,
      species: speciesId,
      terrarium: terrariumId || null,
      weight,
      notes
    })

    // Poblar las referencias para la respuesta
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
    const { terrarium: newTerrariumId, species: newSpeciesId } = req.body

    // Obtener todos los terrarios del usuario para verificar propiedad
    const userTerrariums = await Terrarium.find({ 
      user: req.user._id,
      isActive: true 
    }).select('_id')

    const terrariumIds = userTerrariums.map(t => t._id)

    // Verificar que el animal pertenezca al usuario (está en uno de sus terrarios)
    const currentAnimal = await Animal.findOne({
      _id: req.params.id,
      terrarium: { $in: terrariumIds },
      isActive: true
    }).populate('species')

    if (!currentAnimal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado o no tienes permisos para editarlo'
      })
    }

    // Si se cambia de terrario, verificar que el nuevo terrario también pertenezca al usuario
    if (newTerrariumId) {
      const newTerrarium = await Terrarium.findOne({
        _id: newTerrariumId,
        user: req.user._id,
        isActive: true
      })

      if (!newTerrarium) {
        return res.status(403).json({
          success: false,
          message: 'El terrario especificado no existe o no tienes permisos para usarlo'
        })
      }

      // Verificar compatibilidad de biomas
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
        const compatibilityCheck = await checkBiomeCompatibility(
          newTerrariumId,
          biomeToCheck,
          req.params.id // Excluir el animal actual de la verificación
        )

        if (!compatibilityCheck.compatible) {
          return res.status(400).json({
            success: false,
            message: 'Incompatibilidad de Bioma',
            details: compatibilityCheck.details,
            warning: true
          })
        }
      }
    }

    // Actualizar el animal
    const animal = await Animal.findOneAndUpdate(
      { _id: req.params.id, terrarium: { $in: terrariumIds } },
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
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      { isActive: false, terrarium: null },
      { new: true }
    )

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      })
    }

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

    // Si se mueve a un terrario (no se saca), verificar compatibilidad
    if (terrariumId) {
      const compatibilityCheck = await checkBiomeCompatibility(
        terrariumId,
        animal.species.biome,
        animal._id.toString()
      )

      if (!compatibilityCheck.compatible) {
        return res.status(400).json({
          success: false,
          message: 'Incompatibilidad de Bioma',
          details: compatibilityCheck.details,
          warning: true
        })
      }
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

// Función auxiliar para verificar compatibilidad de biomas
async function checkBiomeCompatibility(terrariumId, newAnimalBiome, excludeAnimalId = null) {
  // Obtener los animales actuales del terrario
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

  // Verificar si todos los animales tienen el mismo bioma
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

    // Obtener todos los terrarios del usuario para verificar propiedad
    const userTerrariums = await Terrarium.find({ 
      user: req.user._id,
      isActive: true 
    }).select('_id')

    const terrariumIds = userTerrariums.map(t => t._id)

    // Buscar el animal y verificar que pertenezca al usuario
    const animal = await Animal.findOne({
      _id: req.params.id,
      terrarium: { $in: terrariumIds },
      isActive: true
    })

    if (!animal) {
      // Si el animal no existe, eliminar el archivo subido
      const filePath = path.join(__dirname, '../../public/uploads/animals', req.file.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado o no tienes permisos para editarlo'
      })
    }

    // Si el animal ya tenía una imagen anterior (y es local), borrarla
    if (animal.imageUrl && !animal.imageUrl.startsWith('http')) {
      // Manejar tanto /uploads como /public/uploads
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

    // Guardar la nueva ruta de la imagen
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
    // Si hay error, eliminar el archivo subido
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

    // Obtener todos los terrarios del usuario para verificar propiedad
    const userTerrariums = await Terrarium.find({ 
      user: req.user._id,
      isActive: true 
    }).select('_id')

    const terrariumIds = userTerrariums.map(t => t._id)

    // Buscar el animal y verificar que pertenezca al usuario
    const animal = await Animal.findOne({
      _id: req.params.id,
      terrarium: { $in: terrariumIds },
      isActive: true
    })

    if (!animal) {
      // Si el animal no existe, eliminar los archivos subidos
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
        message: 'Animal no encontrado o no tienes permisos para editarlo'
      })
    }

    // Añadir las nuevas imágenes a la galería
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
    // Si hay error, eliminar los archivos subidos
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

    // Obtener todos los terrarios del usuario para verificar propiedad
    const userTerrariums = await Terrarium.find({ 
      user: req.user._id,
      isActive: true 
    }).select('_id')

    const terrariumIds = userTerrariums.map(t => t._id)

    // Buscar el animal y verificar que pertenezca al usuario
    const animal = await Animal.findOne({
      _id: req.params.id,
      terrarium: { $in: terrariumIds },
      isActive: true
    })

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado o no tienes permisos para editarlo'
      })
    }

    // Verificar que la imagen esté en la galería
    if (!animal.gallery || !animal.gallery.includes(imageUrl)) {
      return res.status(404).json({
        success: false,
        message: 'La imagen no se encuentra en la galería'
      })
    }

    // Eliminar la imagen del array en MongoDB usando $pull
    animal.gallery = animal.gallery.filter(url => url !== imageUrl)
    await animal.save()

    // Si es una imagen local (no externa), eliminar el archivo físico
    if (!imageUrl.startsWith('http')) {
      // Manejar tanto /uploads como /public/uploads
      const imagePath = imageUrl.replace('/uploads', '').replace('/public', '')
      const fullPath = path.join(__dirname, '../../public', imagePath)
      
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath)
        } catch (error) {
          console.error('Error al eliminar archivo físico:', error.message)
          // No fallar la respuesta si no se puede eliminar el archivo
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
