import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from '@hono/node-server/serve-static'
import { authRoutes } from './routes/auth'
import { itemRoutes } from './routes/items'
import { subItemRoutes } from './routes/sub-items'
import { uploadRoutes } from './routes/upload'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
}))

// Static file serving handled by upload routes

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/items', itemRoutes)
app.route('/api/sub-items', subItemRoutes)
app.route('/api/upload', uploadRoutes)

// Serve uploaded files directly at /uploads/:filename
app.route('/uploads', uploadRoutes)

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
