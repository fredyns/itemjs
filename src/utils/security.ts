import DOMPurify from 'dompurify'

/**
 * Security utilities for input sanitization and XSS prevention
 */

interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: string[]
  stripTags?: boolean
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (
  dirty: string,
  options: SanitizeOptions = {}
): string => {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes = ['class'],
    stripTags = false
  } = options

  if (stripTags) {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] })
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    KEEP_CONTENT: true,
  })
}

/**
 * Sanitize plain text input by removing/escaping dangerous characters
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags but keep content
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=\s*[^>\s]+\s*/gi, '') // Remove event handlers with trailing space
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim() // Trim again after processing
    .slice(0, 1000) // Limit length
}

/**
 * Validate and sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return ''
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = email.trim().toLowerCase()
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize URL to prevent malicious redirects
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return ''
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    
    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Sanitize file names to prevent path traversal
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') return ''
  
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .slice(0, 255) // Limit length
}

/**
 * Validate and sanitize search queries
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return ''
  
  return query
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags but keep content
    .slice(0, 100) // Limit search query length
}

/**
 * Content Security Policy helpers
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }
  
  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier)
    } else {
      this.requests.clear()
    }
  }
}

export const rateLimiter = new RateLimiter()

/**
 * Input validation schemas
 */
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  },
  
  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },
  
  url: (url: string): boolean => {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }
}
