import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Context } from 'hono'
import { prisma } from './db'

// Extend Hono's context type to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: { id: number; email: string }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JWTPayload {
  userId: number
  email: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new Error('Invalid token', { cause: error })
  }
}

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 401)
    }

    c.set('user', { id: user.id, email: user.email })
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ error: 'Unauthorized' }, 401)
  }
}
