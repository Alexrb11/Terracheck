import Species from '../models/Species.js'

// GET /api/species - Obtener todas las especies
export const getAllSpecies = async (req, res) => {
  try {
    const { biome, search } = req.query

    let query = {}

    // Filtrar por bioma si se proporciona
    if (biome) {
      query.biome = biome
    }

    // Búsqueda por texto si se proporciona
    if (search) {
      query.$or = [
        { commonName: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } }
      ]
    }

    const species = await Species.find(query).sort({ commonName: 1 })

    res.json({
      success: true,
      count: species.length,
      data: species
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener especies',
      error: error.message
    })
  }
}

// GET /api/species/:id - Obtener una especie por ID
export const getSpeciesById = async (req, res) => {
  try {
    const species = await Species.findById(req.params.id)

    if (!species) {
      return res.status(404).json({
        success: false,
        message: 'Especie no encontrada'
      })
    }

    res.json({
      success: true,
      data: species
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la especie',
      error: error.message
    })
  }
}

// POST /api/species - Crear una nueva especie (admin)
export const createSpecies = async (req, res) => {
  try {
    const species = await Species.create(req.body)

    res.status(201).json({
      success: true,
      message: 'Especie creada exitosamente',
      data: species
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una especie con ese nombre científico'
      })
    }

    res.status(400).json({
      success: false,
      message: 'Error al crear la especie',
      error: error.message
    })
  }
}
