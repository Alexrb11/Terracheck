import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Species from './models/Species.js'
import Terrarium from './models/Terrarium.js'
import Animal from './models/Animal.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/terrarium-keeper'

// Usuario de prueba
const testUser = {
  name: 'Admin TerraCheck',
  email: 'admin@terracheck.com',
  password: '123456'
}

// Datos de especies
const speciesData = [
  {
    scientificName: 'Eublepharis macularius',
    commonName: 'Gecko Leopardo',
    family: 'Eublepharidae',
    biome: 'Arid',
    parameters: {
      tempMin: 24,
      tempMax: 32,
      humidityMin: 30,
      humidityMax: 40,
      uvIndex: 2
    },
    requirements: {
      minLiters: 75,
      minHeight: 30,
      arboreal: false
    },
    compatibility: ['solitary', 'female-groups'],
    description: 'Gecko nocturno originario de Afganistán, Pakistán e India. Ideal para principiantes.'
  },
  {
    scientificName: 'Correlophus ciliatus',
    commonName: 'Gecko Crestado',
    family: 'Diplodactylidae',
    biome: 'Tropical',
    parameters: {
      tempMin: 22,
      tempMax: 27,
      humidityMin: 60,
      humidityMax: 80,
      uvIndex: 2
    },
    requirements: {
      minLiters: 60,
      minHeight: 45,
      arboreal: true
    },
    compatibility: ['communal', 'female-groups'],
    description: 'Gecko arborícola de Nueva Caledonia. No requiere iluminación especial y es muy dócil.'
  },
  {
    scientificName: 'Python regius',
    commonName: 'Pitón Bola',
    family: 'Pythonidae',
    biome: 'Tropical',
    parameters: {
      tempMin: 26,
      tempMax: 32,
      humidityMin: 50,
      humidityMax: 60,
      uvIndex: 0
    },
    requirements: {
      minLiters: 120,
      minHeight: 30,
      arboreal: false
    },
    compatibility: ['solitary'],
    description: 'Serpiente africana conocida por enrollarse en bola cuando se siente amenazada.'
  },
  {
    scientificName: 'Pogona vitticeps',
    commonName: 'Dragón Barbudo',
    family: 'Agamidae',
    biome: 'Arid',
    parameters: {
      tempMin: 25,
      tempMax: 40,
      humidityMin: 30,
      humidityMax: 40,
      uvIndex: 10
    },
    requirements: {
      minLiters: 200,
      minHeight: 40,
      arboreal: false
    },
    compatibility: ['solitary', 'male-female-pair'],
    description: 'Lagarto australiano muy popular por su carácter sociable y apariencia única.'
  },
  {
    scientificName: 'Dendrobates tinctorius',
    commonName: 'Rana Dardo Azul',
    family: 'Dendrobatidae',
    biome: 'Tropical',
    parameters: {
      tempMin: 22,
      tempMax: 26,
      humidityMin: 80,
      humidityMax: 100,
      uvIndex: 2
    },
    requirements: {
      minLiters: 40,
      minHeight: 30,
      arboreal: false
    },
    compatibility: ['communal', 'same-species-groups'],
    description: 'Rana venenosa de Surinam con colores vibrantes. En cautividad pierde su toxicidad.'
  }
]

async function seed() {
  try {
    console.log('🔄 Conectando a MongoDB...')
    await mongoose.connect(MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    // Limpiar base de datos
    console.log('🗑️  Limpiando base de datos...')
    await User.deleteMany({})
    await Species.deleteMany({})
    await Terrarium.deleteMany({})
    await Animal.deleteMany({})
    console.log('✅ Base de datos limpia')

    // Crear usuario de prueba
    console.log('👤 Creando usuario de prueba...')
    const user = await User.create(testUser)
    console.log(`✅ Usuario creado: ${user.email}`)

    // Insertar especies
    console.log('🦎 Insertando especies...')
    const species = await Species.insertMany(speciesData)
    console.log(`✅ ${species.length} especies insertadas`)

    // Crear mapa de especies por nombre común
    const speciesMap = {}
    species.forEach(s => {
      speciesMap[s.commonName] = s._id
    })

    // Datos de terrarios (ahora con user)
    const terrariumsData = [
      {
        user: user._id,
        name: 'Desértico 90cm',
        dimensions: {
          width: 90,
          depth: 45,
          height: 45
        },
        type: 'glass',
        sensors: {
          temperature: 28,
          humidity: 35,
          lastUpdated: new Date()
        },
        notes: 'Terrario para especies de clima árido con punto caliente y zona fría.'
      },
      {
        user: user._id,
        name: 'Tropical Alto 45x45x60',
        dimensions: {
          width: 45,
          depth: 45,
          height: 60
        },
        type: 'glass',
        sensors: {
          temperature: 24,
          humidity: 75,
          lastUpdated: new Date()
        },
        notes: 'Terrario vertical ideal para especies arborícolas tropicales.'
      },
      {
        user: user._id,
        name: 'Bioactivo Tropical',
        dimensions: {
          width: 60,
          depth: 45,
          height: 45
        },
        type: 'glass',
        sensors: {
          temperature: 25,
          humidity: 85,
          lastUpdated: new Date()
        },
        notes: 'Terrario con sustrato bioactivo y plantas vivas para ranas.'
      }
    ]

    // Insertar terrarios
    console.log('📦 Insertando terrarios...')
    const terrariums = await Terrarium.insertMany(terrariumsData)
    console.log(`✅ ${terrariums.length} terrarios insertados`)

    // Crear mapa de terrarios por nombre
    const terrariumMap = {}
    terrariums.forEach(t => {
      terrariumMap[t.name] = t._id
    })

    // Insertar animales de ejemplo
    console.log('🐍 Insertando animales...')
    const animalsData = [
      {
        name: 'Leo',
        birthDate: new Date('2022-06-15'),
        sex: 'male',
        species: speciesMap['Gecko Leopardo'],
        terrarium: terrariumMap['Desértico 90cm'],
        weight: 65,
        notes: 'Morph: Normal/Wild Type'
      },
      {
        name: 'Luna',
        birthDate: new Date('2023-03-20'),
        sex: 'female',
        species: speciesMap['Gecko Leopardo'],
        terrarium: terrariumMap['Desértico 90cm'],
        weight: 52,
        notes: 'Morph: High Yellow'
      },
      {
        name: 'Coco',
        birthDate: new Date('2023-01-10'),
        sex: 'male',
        species: speciesMap['Gecko Crestado'],
        terrarium: terrariumMap['Tropical Alto 45x45x60'],
        weight: 45,
        notes: 'Morph: Harlequin'
      },
      {
        name: 'Verde',
        birthDate: new Date('2022-09-01'),
        sex: 'female',
        species: speciesMap['Rana Dardo Azul'],
        terrarium: terrariumMap['Bioactivo Tropical'],
        weight: 8,
        notes: 'Coloración azul intenso'
      },
      {
        name: 'Azul',
        birthDate: new Date('2022-09-01'),
        sex: 'female',
        species: speciesMap['Rana Dardo Azul'],
        terrarium: terrariumMap['Bioactivo Tropical'],
        weight: 7,
        notes: 'Coloración azul con manchas negras'
      }
    ]

    const animals = await Animal.insertMany(animalsData)
    console.log(`✅ ${animals.length} animales insertados`)

    console.log('\n✨ Seed completado exitosamente!\n')
    console.log('📊 Resumen:')
    console.log(`   - 1 usuario (${testUser.email} / ${testUser.password})`)
    console.log(`   - ${species.length} especies`)
    console.log(`   - ${terrariums.length} terrarios`)
    console.log(`   - ${animals.length} animales`)
    console.log('\n🔐 Credenciales de prueba:')
    console.log(`   Email: ${testUser.email}`)
    console.log(`   Password: ${testUser.password}`)
    console.log('\n🚀 Puedes iniciar el servidor con: npm run dev\n')

  } catch (error) {
    console.error('❌ Error en seed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de MongoDB')
    process.exit(0)
  }
}

seed()
