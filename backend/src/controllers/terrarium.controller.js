import Terrarium from '../models/Terrarium.js'
import Animal from '../models/Animal.js'

// GET /api/terrariums - Obtener todos los terrarios del usuario con sus animales
export const getAllTerrariums = async (req, res) => {
  try {
    // Filtrar por usuario autenticado
    const terrariums = await Terrarium.find({ 
      user: req.user._id, 
      isActive: true 
    })
      .populate({
        path: 'animals',
        match: { isActive: true },
        populate: {
          path: 'species',
          select: 'commonName scientificName biome parameters'
        }
      })
      .sort({ createdAt: -1 })

    // Agregar información de compatibilidad a cada terrario
    const terrariumsWithCompatibility = terrariums.map(terrarium => {
      const terrariumObj = terrarium.toObject()
      terrariumObj.hasCompatibilityIssue = checkCompatibilityIssues(terrariumObj.animals)
      return terrariumObj
    })

    res.json({
      success: true,
      count: terrariums.length,
      data: terrariumsWithCompatibility
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener terrarios',
      error: error.message
    })
  }
}

// GET /api/terrariums/:id - Obtener un terrario por ID
export const getTerrariumById = async (req, res) => {
  try {
    const terrarium = await Terrarium.findOne({
      _id: req.params.id,
      user: req.user._id // Verificar propiedad
    })
      .populate({
        path: 'animals',
        match: { isActive: true },
        populate: {
          path: 'species',
          select: 'commonName scientificName biome parameters requirements'
        }
      })

    if (!terrarium) {
      return res.status(404).json({
        success: false,
        message: 'Terrario no encontrado'
      })
    }

    const terrariumObj = terrarium.toObject()
    terrariumObj.hasCompatibilityIssue = checkCompatibilityIssues(terrariumObj.animals)

    res.json({
      success: true,
      data: terrariumObj
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el terrario',
      error: error.message
    })
  }
}

// POST /api/terrariums - Crear un nuevo terrario
export const createTerrarium = async (req, res) => {
  try {
    const { name, dimensions, type, notes } = req.body

    const terrarium = await Terrarium.create({
      user: req.user._id, // Asignar al usuario autenticado
      name,
      dimensions,
      type,
      notes
    })

    res.status(201).json({
      success: true,
      message: 'Terrario creado exitosamente',
      data: terrarium
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear el terrario',
      error: error.message
    })
  }
}

// PUT /api/terrariums/:id - Actualizar un terrario
export const updateTerrarium = async (req, res) => {
  try {
    // Verificar que el terrario pertenece al usuario
    const terrarium = await Terrarium.findOneAndUpdate(
      { 
        _id: req.params.id, 
        user: req.user._id // Verificar propiedad
      },
      req.body,
      { new: true, runValidators: true }
    )

    if (!terrarium) {
      return res.status(404).json({
        success: false,
        message: 'Terrario no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Terrario actualizado exitosamente',
      data: terrarium
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el terrario',
      error: error.message
    })
  }
}

// DELETE /api/terrariums/:id - Eliminar un terrario (soft delete)
export const deleteTerrarium = async (req, res) => {
  try {
    // Verificar que el terrario pertenece al usuario
    const terrarium = await Terrarium.findOneAndUpdate(
      { 
        _id: req.params.id, 
        user: req.user._id // Verificar propiedad
      },
      { isActive: false },
      { new: true }
    )

    if (!terrarium) {
      return res.status(404).json({
        success: false,
        message: 'Terrario no encontrado'
      })
    }

    // También desasignar los animales de este terrario
    await Animal.updateMany(
      { terrarium: req.params.id },
      { terrarium: null }
    )

    res.json({
      success: true,
      message: 'Terrario eliminado exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el terrario',
      error: error.message
    })
  }
}

// PUT /api/terrariums/:id/sensors - Actualizar sensores
export const updateSensors = async (req, res) => {
  try {
    const { temperature, humidity } = req.body

    // Verificar que el terrario pertenece al usuario
    const terrarium = await Terrarium.findOneAndUpdate(
      { 
        _id: req.params.id, 
        user: req.user._id // Verificar propiedad
      },
      {
        sensors: {
          temperature,
          humidity,
          lastUpdated: new Date()
        }
      },
      { new: true }
    )

    if (!terrarium) {
      return res.status(404).json({
        success: false,
        message: 'Terrario no encontrado'
      })
    }

    res.json({
      success: true,
      data: terrarium.sensors
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar sensores',
      error: error.message
    })
  }
}

// Función auxiliar para verificar problemas de compatibilidad
function checkCompatibilityIssues(animals) {
  if (!animals || animals.length < 2) {
    return false
  }

  // Verificar biomas diferentes
  const biomes = new Set(animals.map(a => a.species?.biome).filter(Boolean))
  if (biomes.size > 1) {
    return true // Biomas incompatibles
  }

  // Verificar múltiples machos de la misma especie
  const malesBySpecies = {}
  for (const animal of animals) {
    if (animal.sex === 'male' && animal.species) {
      const speciesId = animal.species._id?.toString() || animal.species.toString()
      malesBySpecies[speciesId] = (malesBySpecies[speciesId] || 0) + 1
      if (malesBySpecies[speciesId] > 1) {
        return true // Múltiples machos de la misma especie
      }
    }
  }

  return false
}
