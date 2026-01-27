import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Permission from './models/Permission.js'
import Role from './models/Role.js'
import Species from './models/Species.js'
import Terrarium from './models/Terrarium.js'
import Animal from './models/Animal.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/terrarium-keeper'

// Permisos base del sistema
const basePermissions = [
  // Usuarios
  { name: 'Gestionar Usuarios', slug: 'manage_users', description: 'Crear, editar y eliminar usuarios', category: 'users' },
  { name: 'Ver Usuarios', slug: 'view_users', description: 'Ver lista de usuarios del sistema', category: 'users' },
  
  // Roles
  { name: 'Gestionar Roles', slug: 'manage_roles', description: 'Crear, editar y eliminar roles', category: 'roles' },
  
  // Terrarios
  { name: 'Gestionar Todos los Terrarios', slug: 'manage_all_terrariums', description: 'Acceder a terrarios de todos los usuarios', category: 'terrariums' },
  { name: 'Ver Todos los Terrarios', slug: 'view_all_terrariums', description: 'Ver terrarios de todos los usuarios', category: 'terrariums' },
  
  // Animales
  { name: 'Gestionar Todos los Animales', slug: 'manage_all_animals', description: 'Acceder a animales de todos los usuarios', category: 'animals' },
  
  // Especies
  { name: 'Gestionar Especies', slug: 'manage_species', description: 'Crear, editar y eliminar especies del catálogo', category: 'species' },
  
  // Sistema
  { name: 'Ver Estadísticas', slug: 'view_statistics', description: 'Ver estadísticas generales del sistema', category: 'system' },
  { name: 'Acceso Panel Admin', slug: 'access_admin_panel', description: 'Acceder al panel de administración', category: 'system' }
]

// Datos de especies
const speciesData = [
  {
    scientificName: 'Eublepharis macularius',
    commonName: 'Gecko Leopardo',
    family: 'Eublepharidae',
    biome: 'desert',
    parameters: { 
      temperature: { min: 24, max: 32 }, 
      humidity: { min: 30, max: 40 }, 
      uvIndex: 2 
    },
    requirements: { minLiters: 75, minHeight: 30, arboreal: false },
    compatibility: ['solitary', 'female-groups'],
    description: 'Gecko nocturno originario de Afganistán, Pakistán e India. Ideal para principiantes.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Eublepharis_macularius_01.jpg/250px-Eublepharis_macularius_01.jpg'
  },
  {
    scientificName: 'Correlophus ciliatus',
    commonName: 'Gecko Crestado',
    family: 'Diplodactylidae',
    biome: 'tropical',
    parameters: { 
      temperature: { min: 22, max: 27 }, 
      humidity: { min: 60, max: 80 }, 
      uvIndex: 2 
    },
    requirements: { minLiters: 60, minHeight: 45, arboreal: true },
    compatibility: ['communal', 'female-groups'],
    description: 'Gecko arborícola de Nueva Caledonia. No requiere iluminación especial y es muy dócil.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Gekkoninae_Rhacodactylus_ciliatus_tete.png/250px-Gekkoninae_Rhacodactylus_ciliatus_tete.png'
  },
  {
    scientificName: 'Python regius',
    commonName: 'Pitón Bola',
    family: 'Pythonidae',
    biome: 'tropical',
    parameters: { 
      temperature: { min: 26, max: 32 }, 
      humidity: { min: 50, max: 60 }, 
      uvIndex: 0 
    },
    requirements: { minLiters: 120, minHeight: 30, arboreal: false },
    compatibility: ['solitary'],
    description: 'Serpiente africana conocida por enrollarse en bola cuando se siente amenazada.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Ball_python_lucy.JPG/250px-Ball_python_lucy.JPG'
  },
  {
    scientificName: 'Pogona vitticeps',
    commonName: 'Dragón Barbudo',
    family: 'Agamidae',
    biome: 'desert',
    parameters: { 
      temperature: { min: 25, max: 40 }, 
      humidity: { min: 30, max: 40 }, 
      uvIndex: 10 
    },
    requirements: { minLiters: 200, minHeight: 40, arboreal: false },
    compatibility: ['solitary', 'male-female-pair'],
    description: 'Lagarto australiano muy popular por su carácter sociable y apariencia única.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Bartagame_%28fcm%29.jpg/250px-Bartagame_%28fcm%29.jpg'
  },
  {
    scientificName: 'Dendrobates tinctorius',
    commonName: 'Rana Dardo Azul',
    family: 'Dendrobatidae',
    biome: 'tropical',
    parameters: { 
      temperature: { min: 22, max: 26 }, 
      humidity: { min: 80, max: 100 }, 
      uvIndex: 2 
    },
    requirements: { minLiters: 40, minHeight: 30, arboreal: false },
    compatibility: ['communal', 'same-species-groups'],
    description: 'Rana venenosa de Surinam con colores vibrantes. En cautividad pierde su toxicidad.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Dendrobates_azureus_qtl1.jpg/250px-Dendrobates_azureus_qtl1.jpg'
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
    await Permission.deleteMany({})
    await Role.deleteMany({})
    await Species.deleteMany({})
    await Terrarium.deleteMany({})
    await Animal.deleteMany({})
    console.log('✅ Base de datos limpia')

    // ============== CREAR PERMISOS ==============
    console.log('🔐 Creando permisos...')
    const permissions = await Permission.insertMany(basePermissions)
    console.log(`   ✅ ${permissions.length} permisos creados`)

    // Crear mapa de permisos por slug
    const permissionMap = {}
    permissions.forEach(p => {
      permissionMap[p.slug] = p._id
    })

    // ============== CREAR ROLES ==============
    console.log('👔 Creando roles...')
    
    // Super Admin - todos los permisos
    const superAdminRole = await Role.create({
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Acceso completo a todas las funciones del sistema',
      permissions: permissions.map(p => p._id), // Todos los permisos
      isSystem: true
    })
    console.log('   ✅ Rol Super Admin creado')

    // Usuario normal - sin permisos de admin
    const userRole = await Role.create({
      name: 'Usuario',
      slug: 'user',
      description: 'Usuario estándar con acceso a sus propios recursos',
      permissions: [], // Sin permisos especiales
      isSystem: true
    })
    console.log('   ✅ Rol Usuario creado')

    // Moderador - permisos parciales (ejemplo de rol personalizado)
    const moderatorRole = await Role.create({
      name: 'Moderador',
      slug: 'moderator',
      description: 'Puede ver estadísticas y gestionar especies',
      permissions: [
        permissionMap['view_statistics'],
        permissionMap['manage_species'],
        permissionMap['access_admin_panel']
      ],
      isSystem: false
    })
    console.log('   ✅ Rol Moderador creado')

    // ============== CREAR USUARIOS ==============
    console.log('👤 Creando usuarios de prueba...')
    
    const adminUser = await User.create({
      name: 'Admin TerraCheck',
      email: 'admin@terracheck.com',
      password: 'admin123',
      role: superAdminRole._id
    })
    console.log(`   ✅ ${adminUser.email} (Super Admin)`)

    const regularUser = await User.create({
      name: 'Usuario Demo',
      email: 'user@terracheck.com',
      password: 'user123',
      role: userRole._id
    })
    console.log(`   ✅ ${regularUser.email} (Usuario)`)

    // ============== CREAR ESPECIES ==============
    console.log('🦎 Insertando especies...')
    const species = await Species.insertMany(speciesData)
    console.log(`   ✅ ${species.length} especies insertadas`)

    // Crear mapa de especies por nombre común
    const speciesMap = {}
    species.forEach(s => {
      speciesMap[s.commonName] = s._id
    })

    // ============== CREAR TERRARIOS ==============
    console.log('📦 Insertando terrarios...')
    const terrariumsData = [
      {
        user: adminUser._id,
        name: 'Desértico 90cm',
        dimensions: { width: 90, depth: 45, height: 45 },
        type: 'glass',
        biome: 'desert',
        notes: 'Terrario para especies de clima árido con punto caliente y zona fría.'
      },
      {
        user: adminUser._id,
        name: 'Tropical Alto 45x45x60',
        dimensions: { width: 45, depth: 45, height: 60 },
        type: 'glass',
        biome: 'tropical',
        notes: 'Terrario vertical ideal para especies arborícolas tropicales.'
      },
      {
        user: adminUser._id,
        name: 'Bioactivo Tropical',
        dimensions: { width: 60, depth: 45, height: 45 },
        type: 'glass',
        biome: 'tropical',
        notes: 'Terrario con sustrato bioactivo y plantas vivas para ranas.'
      }
    ]
    const terrariums = await Terrarium.insertMany(terrariumsData)
    console.log(`   ✅ ${terrariums.length} terrarios insertados`)

    // Crear mapa de terrarios
    const terrariumMap = {}
    terrariums.forEach(t => {
      terrariumMap[t.name] = t._id
    })

    // ============== CREAR ANIMALES ==============
    console.log('🐍 Insertando animales...')
    const animalsData = [
      { user: adminUser._id, name: 'Leo', birthDate: new Date('2022-06-15'), sex: 'male', species: speciesMap['Gecko Leopardo'], terrarium: terrariumMap['Desértico 90cm'], weight: 65, notes: 'Morph: Normal/Wild Type' },
      { user: adminUser._id, name: 'Luna', birthDate: new Date('2023-03-20'), sex: 'female', species: speciesMap['Gecko Leopardo'], terrarium: terrariumMap['Desértico 90cm'], weight: 52, notes: 'Morph: High Yellow' },
      { user: adminUser._id, name: 'Coco', birthDate: new Date('2023-01-10'), sex: 'male', species: speciesMap['Gecko Crestado'], terrarium: terrariumMap['Tropical Alto 45x45x60'], weight: 45, notes: 'Morph: Harlequin' },
      { user: adminUser._id, name: 'Verde', birthDate: new Date('2022-09-01'), sex: 'female', species: speciesMap['Rana Dardo Azul'], terrarium: terrariumMap['Bioactivo Tropical'], weight: 8, notes: 'Coloración azul intenso' },
      { user: adminUser._id, name: 'Azul', birthDate: new Date('2022-09-01'), sex: 'female', species: speciesMap['Rana Dardo Azul'], terrarium: terrariumMap['Bioactivo Tropical'], weight: 7, notes: 'Coloración azul con manchas negras' }
    ]
    const animals = await Animal.insertMany(animalsData)
    console.log(`   ✅ ${animals.length} animales insertados`)

    // ============== RESUMEN ==============
    console.log('\n✨ Seed completado exitosamente!\n')
    console.log('📊 Resumen:')
    console.log(`   - ${permissions.length} permisos`)
    console.log(`   - 3 roles (Super Admin, Usuario, Moderador)`)
    console.log(`   - 2 usuarios`)
    console.log(`   - ${species.length} especies`)
    console.log(`   - ${terrariums.length} terrarios`)
    console.log(`   - ${animals.length} animales`)
    console.log('\n🔐 Credenciales de prueba:')
    console.log('   ┌─────────────────────────────────────────────────┐')
    console.log('   │ SUPER ADMIN (acceso completo)                  │')
    console.log('   │   Email:    admin@terracheck.com               │')
    console.log('   │   Password: admin123                           │')
    console.log('   ├─────────────────────────────────────────────────┤')
    console.log('   │ USUARIO (acceso limitado)                      │')
    console.log('   │   Email:    user@terracheck.com                │')
    console.log('   │   Password: user123                            │')
    console.log('   └─────────────────────────────────────────────────┘')
    console.log('\n🚀 Puedes iniciar el servidor con: npm run dev\n')

  } catch (error) {
    console.error('❌ Error en seed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de MongoDB')
    process.exit(0)
  }
}

seed()
