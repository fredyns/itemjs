import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/db'
import { hashPassword, comparePassword, generateToken } from '../lib/auth'

export const authRoutes = new Hono()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Register
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400)
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      }
    })

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email })

    return c.json({
      user,
      token,
      message: 'User registered successfully'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json')

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email })

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get current user
authRoutes.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.substring(7)
    const { verifyToken } = await import('../lib/auth')
    const payload = verifyToken(token)
    
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 401)
    }

    return c.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Unauthorized' }, 401)
  }
})
