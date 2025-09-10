import {Hono} from 'hono'
import {serve} from '@hono/node-server'
import {cors} from 'hono/cors'
import {logger} from 'hono/logger'
import {authRoutes} from './routes/auth'
import {itemRoutes} from './routes/items'
import {subItemRoutes} from './routes/sub-items'
import {uploadRoutes} from './routes/upload'

const app = new Hono()

// Middleware
app.use('*', logger())

// Dynamic CORS configuration based on environment
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
const allowedOrigins = [frontendUrl]

// Add additional origins for development
if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000')
}

app.use('*', cors({
    origin: allowedOrigins,
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
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
    return c.json({status: 'ok', timestamp: new Date().toISOString()})
})

const port = parseInt(process.env.BACKEND_PORT || '3001')
console.log(`Server is running on port ${port}`)
console.log(`CORS origins: ${allowedOrigins.join(', ')}`)

serve({
    fetch: app.fetch,
    port,
})
