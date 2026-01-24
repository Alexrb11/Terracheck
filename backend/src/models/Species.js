import mongoose from 'mongoose'
import { BIOME_LIST } from '../constants/biomes.js'

const speciesSchema = new mongoose.Schema({
  // Información general
  scientificName: {
    type: String,
    required: [true, 'El nombre científico es requerido'],
    unique: true,
    trim: true
  },
  commonName: {
    type: String,
    required: [true, 'El nombre común es requerido'],
    trim: true
  },
  family: {
    type: String,
    required: true,
    trim: true
  },
  biome: {
    type: String,
    required: true,
    enum: BIOME_LIST
  },

  // Parámetros ambientales requeridos
  parameters: {
    temperature: {
      min: {
        type: Number,
        required: true,
        min: 0,
        max: 50
      },
      max: {
        type: Number,
        required: true,
        min: 0,
        max: 50
      }
    },
    humidity: {
      min: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      max: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    },
    uvIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 14
    }
  },

  // Requerimientos de espacio
  requirements: {
    minLiters: {
      type: Number,
      required: true,
      min: 1
    },
    minHeight: {
      type: Number,
      required: true,
      min: 10
    },
    arboreal: {
      type: Boolean,
      default: false
    }
  },

  // Compatibilidad
  compatibility: {
    type: [String],
    default: []
  },

  // Imagen (URL opcional)
  imageUrl: {
    type: String,
    default: null
  },

  // Descripción
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Índices para búsquedas eficientes
speciesSchema.index({ commonName: 'text', scientificName: 'text' })
speciesSchema.index({ biome: 1 })

const Species = mongoose.model('Species', speciesSchema)

export default Species
