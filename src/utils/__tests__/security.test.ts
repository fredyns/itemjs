import {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFileName,
  sanitizeSearchQuery,
  generateNonce,
  rateLimiter,
  validators
} from '../security'

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((input, options) => {
    if (options?.ALLOWED_TAGS?.length === 0) {
      return input.replace(/<[^>]*>/g, '')
    }
    return input
  })
}))

describe('Security Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    rateLimiter.reset()
  })

  describe('sanitizeHtml', () => {
    it('should sanitize HTML content', () => {
      const dirty = '<script>alert("xss")</script><p>Safe content</p>'
      const result = sanitizeHtml(dirty)
      expect(result).toBe(dirty) // Mocked to return input
    })

    it('should strip all tags when stripTags is true', () => {
      const dirty = '<p>Hello <strong>world</strong></p>'
      const result = sanitizeHtml(dirty, { stripTags: true })
      expect(result).toBe('Hello world')
    })
  })

  describe('sanitizeText', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>Hello World'
      const result = sanitizeText(input)
      expect(result).toBe('alert("xss")Hello World')
    })

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")'
      const result = sanitizeText(input)
      expect(result).toBe('alert("xss")')
    })

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss") Hello'
      const result = sanitizeText(input)
      expect(result).toBe('Hello')
    })

    it('should limit text length', () => {
      const input = 'a'.repeat(1500)
      const result = sanitizeText(input)
      expect(result).toHaveLength(1000)
    })

    it('should handle null/undefined input', () => {
      expect(sanitizeText(null as any)).toBe('')
      expect(sanitizeText(undefined as any)).toBe('')
      expect(sanitizeText('')).toBe('')
    })

    it('should trim whitespace', () => {
      const input = '  hello world  '
      const result = sanitizeText(input)
      expect(result).toBe('hello world')
    })
  })

  describe('sanitizeEmail', () => {
    it('should sanitize valid email', () => {
      const email = 'Test@Example.COM'
      const result = sanitizeEmail(email)
      expect(result).toBe('test@example.com')
    })

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('invalid-email')).toBe('')
      expect(sanitizeEmail('test@')).toBe('')
      expect(sanitizeEmail('@example.com')).toBe('')
      expect(sanitizeEmail('test@example')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(sanitizeEmail(null as any)).toBe('')
      expect(sanitizeEmail(undefined as any)).toBe('')
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow valid HTTP URLs', () => {
      const url = 'http://example.com/path'
      const result = sanitizeUrl(url)
      expect(result).toBe(url)
    })

    it('should allow valid HTTPS URLs', () => {
      const url = 'https://example.com/path'
      const result = sanitizeUrl(url)
      expect(result).toBe(url)
    })

    it('should reject javascript protocol', () => {
      const url = 'javascript:alert("xss")'
      const result = sanitizeUrl(url)
      expect(result).toBe('')
    })

    it('should reject data protocol', () => {
      const url = 'data:text/html,<script>alert("xss")</script>'
      const result = sanitizeUrl(url)
      expect(result).toBe('')
    })

    it('should handle invalid URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBe('')
      expect(sanitizeUrl('')).toBe('')
      expect(sanitizeUrl(null as any)).toBe('')
    })
  })

  describe('sanitizeFileName', () => {
    it('should replace special characters with underscore', () => {
      const fileName = 'test file!@#$%^&*().txt'
      const result = sanitizeFileName(fileName)
      expect(result).toBe('test_file__________.txt')
    })

    it('should remove leading dots', () => {
      const fileName = '...test.txt'
      const result = sanitizeFileName(fileName)
      expect(result).toBe('test.txt')
    })

    it('should replace multiple dots with single dot', () => {
      const fileName = 'test...file.txt'
      const result = sanitizeFileName(fileName)
      expect(result).toBe('test.file.txt')
    })

    it('should limit file name length', () => {
      const fileName = 'a'.repeat(300) + '.txt'
      const result = sanitizeFileName(fileName)
      expect(result).toHaveLength(255)
    })

    it('should handle null/undefined input', () => {
      expect(sanitizeFileName(null as any)).toBe('')
      expect(sanitizeFileName(undefined as any)).toBe('')
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should remove dangerous characters', () => {
      const query = '<script>alert("xss")</script>search term'
      const result = sanitizeSearchQuery(query)
      expect(result).toBe('alert("xss")search term')
    })

    it('should preserve quotes in search queries', () => {
      const query = 'search "term" with \'quotes\''
      const result = sanitizeSearchQuery(query)
      expect(result).toBe('search "term" with \'quotes\'')
    })

    it('should limit query length', () => {
      const query = 'a'.repeat(150)
      const result = sanitizeSearchQuery(query)
      expect(result).toHaveLength(100)
    })

    it('should trim whitespace', () => {
      const query = '  search term  '
      const result = sanitizeSearchQuery(query)
      expect(result).toBe('search term')
    })
  })

  describe('generateNonce', () => {
    it('should generate a nonce string', () => {
      const nonce = generateNonce()
      expect(typeof nonce).toBe('string')
      expect(nonce).toHaveLength(32) // 16 bytes * 2 hex chars
    })

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()
      expect(nonce1).not.toBe(nonce2)
    })
  })

  describe('rateLimiter', () => {
    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true)
      expect(rateLimiter.isAllowed('user1')).toBe(true)
    })

    it('should block requests when limit exceeded', () => {
      // Create a rate limiter with low limits for testing
      const testLimiter = new (rateLimiter.constructor as any)(2, 1000) // 2 requests per second
      
      expect(testLimiter.isAllowed('user1')).toBe(true)
      expect(testLimiter.isAllowed('user1')).toBe(true)
      expect(testLimiter.isAllowed('user1')).toBe(false)
    })

    it('should reset limits for specific user', () => {
      rateLimiter.isAllowed('user1')
      rateLimiter.reset('user1')
      expect(rateLimiter.isAllowed('user1')).toBe(true)
    })

    it('should reset all limits', () => {
      rateLimiter.isAllowed('user1')
      rateLimiter.isAllowed('user2')
      rateLimiter.reset()
      expect(rateLimiter.isAllowed('user1')).toBe(true)
      expect(rateLimiter.isAllowed('user2')).toBe(true)
    })
  })

  describe('validators', () => {
    describe('email', () => {
      it('should validate correct emails', () => {
        expect(validators.email('test@example.com')).toBe(true)
        expect(validators.email('user.name@domain.co.uk')).toBe(true)
      })

      it('should reject invalid emails', () => {
        expect(validators.email('invalid-email')).toBe(false)
        expect(validators.email('test@')).toBe(false)
        expect(validators.email('@example.com')).toBe(false)
      })

      it('should reject emails that are too long', () => {
        const longEmail = 'a'.repeat(250) + '@example.com'
        expect(validators.email(longEmail)).toBe(false)
      })
    })

    describe('password', () => {
      it('should validate strong passwords', () => {
        const result = validators.password('StrongPass123!')
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject passwords that are too short', () => {
        const result = validators.password('Short1!')
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Password must be at least 8 characters long')
      })

      it('should require uppercase letter', () => {
        const result = validators.password('lowercase123!')
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Password must contain at least one uppercase letter')
      })

      it('should require lowercase letter', () => {
        const result = validators.password('UPPERCASE123!')
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Password must contain at least one lowercase letter')
      })

      it('should require number', () => {
        const result = validators.password('NoNumbers!')
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Password must contain at least one number')
      })

      it('should require special character', () => {
        const result = validators.password('NoSpecialChar123')
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Password must contain at least one special character')
      })
    })

    describe('url', () => {
      it('should validate HTTP URLs', () => {
        expect(validators.url('http://example.com')).toBe(true)
      })

      it('should validate HTTPS URLs', () => {
        expect(validators.url('https://example.com')).toBe(true)
      })

      it('should reject invalid protocols', () => {
        expect(validators.url('ftp://example.com')).toBe(false)
        expect(validators.url('javascript:alert("xss")')).toBe(false)
      })

      it('should reject invalid URLs', () => {
        expect(validators.url('not-a-url')).toBe(false)
        expect(validators.url('')).toBe(false)
      })
    })
  })
})
