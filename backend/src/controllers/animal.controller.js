import Animal from '../models/Animal.js'
import Species from '../models/Species.js'
import Terrarium from '../models/Terrarium.js'

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
