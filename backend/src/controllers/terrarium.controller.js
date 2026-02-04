import Terrarium from '../models/Terrarium.js'
import Animal from '../models/Animal.js'
import User from '../models/User.js'

const hasPermission = async (resource, user) => {
  // Admin/Super Admin tienen acceso total (maestro), sin importar propietario
  let userWithRole = user
  if (!user.role || (typeof user.role === 'object' && !user.role.slug)) {
    userWithRole = await User.findById(user._id).populate('role', 'slug')
  }
  const roleSlug = userWithRole.role?.slug ?? (typeof userWithRole.role === 'object' ? userWithRole.role?.slug : null)
  if (roleSlug === 'admin' || roleSlug === 'super_admin') {
    return true
  }

  if (resource.user && resource.user.toString() === user._id.toString()) {
    return true
  }
  return false
}

// GET /api/terrariums - Obtener todos los terrarios del usuario con sus animales
export const getAllTerrariums = async (req, res) => {
  try {
    let userWithRole = req.user
    if (!req.user.role || typeof req.user.role === 'object' && !req.user.role.slug) {
      userWithRole = await User.findById(req.user._id).populate('role', 'slug')
    }
    const roleSlug = userWithRole.role?.slug || (typeof userWithRole.role === 'object' ? userWithRole.role.slug : null)
    const isAdmin = roleSlug === 'admin' || roleSlug === 'super_admin'

    const query = { isActive: true }
    if (!isAdmin) {
      query.user = req.user._id
    }

    const terrariums = await Terrarium.find(query)
      .populate({
        path: 'animals',
        match: { isActive: true },
        populate: {
          path: 'species',
          select: 'commonName scientificName biome parameters'
        }
      })
      .sort({ createdAt: -1 })

    const terrariumsWithCompatibility = terrariums.map(terrarium => {
      const terrariumObj = terrarium.toObject()
      terrariumObj.hasCompatibilityIssue = checkCompatibilityIssues(terrariumObj.animals)
      terrariumObj.requirements = calculateTerrariumRequirements(terrariumObj.animals)
      terrariumObj.parameters = calculateParameters(terrariumObj.animals)
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
    const terrarium = await Terrarium.findById(req.params.id)
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

    if (!await hasPermission(terrarium, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este terrario'
      })
    }

    if (!terrarium.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Terrario no encontrado'
      })
    }

    const terrariumObj = terrarium.toObject()
    terrariumObj.hasCompatibilityIssue = checkCompatibilityIssues(terrariumObj.animals)
    terrariumObj.requirements = calculateTerrariumRequirements(terrariumObj.animals)
    terrariumObj.parameters = calculateParameters(terrariumObj.animals)

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
    const { name, dimensions, type, biome, notes } = req.body

    const terrarium = await Terrarium.create({
      user: req.user._id,
      name,
      dimensions,
      type,
      biome,
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
    const terrarium = await Terrarium.findById(req.params.id)

    if (!terrarium) {
      return res.status(404).json({
        success: false,
        message: 'Terrario no encontrado'
      })
    }

    if (!await hasPermission(terrarium, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este terrario'
      })
    }

    if (!terrarium.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Terrario no encontrado'
      })
    }

    const updatedTerrarium = await Terrarium.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Terrario actualizado exitosamente',
      data: updatedTerrarium
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
    const terrarium = await Terrarium.findById(req.params.id)

    if (!terrarium) {
      return res.status(404).json({
        success: false,
        message: 'Terrario no encontrado'
      })
    }

    if (!await hasPermission(terrarium, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este terrario'
      })
    }

    terrarium.isActive = false
    await terrarium.save()

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

const getTempMin = (params) => {
  if (params.tempMin !== undefined) return params.tempMin
  if (params.temperature?.min !== undefined) return params.temperature.min
  return null
}

const getTempMax = (params) => {
  if (params.tempMax !== undefined) return params.tempMax
  if (params.temperature?.max !== undefined) return params.temperature.max
  return null
}

const getHumMin = (params) => {
  if (params.humidityMin !== undefined) return params.humidityMin
  if (params.humidity?.min !== undefined) return params.humidity.min
  return null
}

const getHumMax = (params) => {
  if (params.humidityMax !== undefined) return params.humidityMax
  if (params.humidity?.max !== undefined) return params.humidity.max
  return null
}

function calculateParameters(animals) {
  if (!animals || animals.length === 0) {
    return null
  }

  const animalsWithSpecies = animals.filter(
    animal => animal.species && 
    animal.species.parameters && 
    (animal.species.parameters.tempMin !== undefined || 
     (animal.species.parameters.temperature && animal.species.parameters.temperature.min !== undefined))
  )

  if (animalsWithSpecies.length === 0) {
    return null
  }

  const tempMins = animalsWithSpecies
    .map(a => getTempMin(a.species.parameters))
    .filter(val => val !== null)
  const tempMaxs = animalsWithSpecies
    .map(a => getTempMax(a.species.parameters))
    .filter(val => val !== null)

  if (tempMins.length === 0 || tempMaxs.length === 0) {
    return null
  }

  const idealTempMin = Math.max(...tempMins)
  const idealTempMax = Math.min(...tempMaxs)

  const humMins = animalsWithSpecies
    .map(a => getHumMin(a.species.parameters))
    .filter(val => val !== null)
  const humMaxs = animalsWithSpecies
    .map(a => getHumMax(a.species.parameters))
    .filter(val => val !== null)

  if (humMins.length === 0 || humMaxs.length === 0) {
    return null
  }

  const idealHumMin = Math.max(...humMins)
  const idealHumMax = Math.min(...humMaxs)

  const errors = []
  let isCompatible = true
  const incompatibleSpecies = []

  if (idealTempMin > idealTempMax) {
    isCompatible = false
    errors.push('Conflicto de temperatura: los rangos de temperatura de las especies no se intersectan')
  }

  if (idealHumMin > idealHumMax) {
    isCompatible = false
    errors.push('Conflicto de humedad: los rangos de humedad de las especies no se intersectan')
  }

  if (!isCompatible) {
    animalsWithSpecies.forEach(animal => {
      const tempMin = getTempMin(animal.species.parameters)
      const tempMax = getTempMax(animal.species.parameters)
      const humMin = getHumMin(animal.species.parameters)
      const humMax = getHumMax(animal.species.parameters)

      incompatibleSpecies.push({
        animalName: animal.name,
        speciesName: animal.species.commonName || animal.species.scientificName,
        temperature: {
          min: tempMin,
          max: tempMax
        },
        humidity: {
          min: humMin,
          max: humMax
        }
      })
    })
  }

  return {
    compatibility: {
      isCompatible,
      errors,
      incompatibleSpecies: incompatibleSpecies.length > 0 ? incompatibleSpecies : undefined
    },
    temperature: {
      min: idealTempMin,
      max: idealTempMax
    },
    humidity: {
      min: idealHumMin,
      max: idealHumMax
    }
  }
}

function calculateTerrariumRequirements(animals) {
  if (!animals || animals.length === 0) {
    return null
  }

  const animalsWithSpecies = animals.filter(
    animal => animal.species && 
    animal.species.parameters && 
    (animal.species.parameters.tempMin !== undefined || 
     (animal.species.parameters.temperature && animal.species.parameters.temperature.min !== undefined))
  )

  if (animalsWithSpecies.length === 0) {
    return null
  }

  const tempMins = animalsWithSpecies
    .map(a => getTempMin(a.species.parameters))
    .filter(val => val !== null)
  const tempMaxs = animalsWithSpecies
    .map(a => getTempMax(a.species.parameters))
    .filter(val => val !== null)

  if (tempMins.length === 0 || tempMaxs.length === 0) {
    return null
  }

  const targetTempMin = Math.max(...tempMins)
  const targetTempMax = Math.min(...tempMaxs)

  const humMins = animalsWithSpecies
    .map(a => getHumMin(a.species.parameters))
    .filter(val => val !== null)
  const humMaxs = animalsWithSpecies
    .map(a => getHumMax(a.species.parameters))
    .filter(val => val !== null)

  if (humMins.length === 0 || humMaxs.length === 0) {
    return null
  }

  const targetHumMin = Math.max(...humMins)
  const targetHumMax = Math.min(...humMaxs)

  const errors = []
  let isCompatible = true

  if (targetTempMin > targetTempMax) {
    isCompatible = false
    errors.push('Rango de temperatura imposible: los rangos de temperatura de las especies no se intersectan')
  }

  if (targetHumMin > targetHumMax) {
    isCompatible = false
    errors.push('Rango de humedad imposible: los rangos de humedad de las especies no se intersectan')
  }

  return {
    temperature: {
      min: targetTempMin,
      max: targetTempMax,
      unit: 'C'
    },
    humidity: {
      min: targetHumMin,
      max: targetHumMax,
      unit: '%'
    },
    compatibility: {
      isCompatible,
      errors
    }
  }
}

function checkCompatibilityIssues(animals) {
  if (!animals || animals.length < 2) {
    return false
  }

  const biomes = new Set(animals.map(a => a.species?.biome).filter(Boolean))
  if (biomes.size > 1) {
    return true
  }

  const malesBySpecies = {}
  for (const animal of animals) {
    if (animal.sex === 'male' && animal.species) {
      const speciesId = animal.species._id?.toString() || animal.species.toString()
      malesBySpecies[speciesId] = (malesBySpecies[speciesId] || 0) + 1
      if (malesBySpecies[speciesId] > 1) {
        return true
      }
    }
  }

  return false
}
