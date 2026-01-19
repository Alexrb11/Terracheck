import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Routes
import authRoutes from './routes/auth.routes.js'
import speciesRoutes from './routes/species.routes.js'
import terrariumRoutes from './routes/terrarium.routes.js'
import animalRoutes from './routes/animal.routes.js'
import adminRoutes from './routes/admin.routes.js'
import roleRoutes from './routes/role.routes.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/terrarium-keeper'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Verificar JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET no definido. Usando valor por defecto (no recomendado en producción)')
}

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/species', speciesRoutes)
app.use('/api/terrariums', terrariumRoutes)
app.use('/api/animals', animalRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/roles', roleRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TerrariumKeeper API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      species: '/api/species',
      terrariums: '/api/terrariums',
      animals: '/api/animals',
      admin: '/api/admin',
      roles: '/api/admin/roles'
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  })
})

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB')
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
      console.log(`📚 API disponible en http://localhost:${PORT}/api`)
      console.log(`🔐 Auth endpoints en http://localhost:${PORT}/api/auth`)
    })
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message)
    process.exit(1)
  })

export default app
