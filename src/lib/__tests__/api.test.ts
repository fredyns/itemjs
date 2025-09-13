import { itemsApi, authApi, subItemsApi } from '../api'
import { mockItem, mockSubItem, mockAuthResponse, mockUser, mockPaginatedResponse } from '../../test/utils'

// Mock fetch globally
global.fetch = jest.fn()
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock environment variables
const originalEnv = import.meta.env
beforeAll(() => {
  Object.defineProperty(import.meta, 'env', {
    value: {
      ...originalEnv,
      VITE_API_URL: 'http://localhost:3001'
    },
    writable: true
  })
})

afterAll(() => {
  Object.defineProperty(import.meta, 'env', {
    value: originalEnv,
    writable: true
  })
})

describe('itemsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('getAll', () => {
    it('fetches items with default parameters', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      } as Response)

      const result = await itemsApi.getAll()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/items?page=1&limit=12',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('fetches items with custom parameters', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      } as Response)

      await itemsApi.getAll({ page: 2, limit: 24, search: 'test' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/items?page=2&limit=24&search=test',
        expect.objectContaining({
          method: 'GET',
        })
      )
    })

    it('includes authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token')
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse,
      } as Response)

      await itemsApi.getAll()

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        })
      )
    })

    it('throws error when response is not ok', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(itemsApi.getAll()).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('getById', () => {
    it('fetches item by id', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      } as Response)

      const result = await itemsApi.getById(1)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/items/1',
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockItem)
    })
  })

  describe('create', () => {
    it('creates new item with data object', async () => {
      const itemData = {
        title: 'New Item',
        content: 'Test content',
        gltfFile: 'model.gltf',
        image: 'image.jpg'
      }
      
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      } as Response)

      const result = await itemsApi.create(itemData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/items',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        })
      )
      expect(result).toEqual(mockItem)
    })

    it('requires authentication token for create', async () => {
      localStorage.setItem('token', 'test-token')
      const itemData = { title: 'Test Item' }
      
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      } as Response)

      await itemsApi.create(itemData)

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        })
      )
    })
  })

  describe('update', () => {
    it('updates existing item', async () => {
      const updateData = {
        title: 'Updated Item',
        content: 'Updated content'
      }
      
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      } as Response)

      const result = await itemsApi.update(1, updateData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/items/1',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(mockItem)
    })
  })

  describe('delete', () => {
    it('deletes item by id', async () => {
      const deleteResponse = { message: 'Item deleted successfully' }
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse,
      } as Response)

      const result = await itemsApi.delete(1)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/items/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toEqual(deleteResponse)
    })
  })
})

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('logs in user with credentials', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      } as Response)

      const credentials = { email: 'test@example.com', password: 'password' }
      const result = await authApi.login(credentials.email, credentials.password)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        })
      )
      expect(result).toEqual(mockAuthResponse)
    })

    it('handles login errors', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const credentials = { email: 'test@example.com', password: 'wrong' }
      
      await expect(authApi.login(credentials.email, credentials.password)).rejects.toThrow('HTTP error! status: 401')
    })
  })

  describe('register', () => {
    it('registers new user', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      } as Response)

      const userData = { 
        email: 'test@example.com', 
        password: 'password',
        confirmPassword: 'password'
      }
      const result = await authApi.register(userData.email, userData.password)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userData.email, password: userData.password }),
        })
      )
      expect(result).toEqual(mockAuthResponse)
    })
  })

  describe('me', () => {
    it('fetches user profile with token', async () => {
      localStorage.setItem('auth_token', 'test-token')
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      } as Response)

      const result = await authApi.me()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/me',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        })
      )
      expect(result).toEqual({ user: mockUser })
    })

    it('throws error when no token available', async () => {
      await expect(authApi.me()).rejects.toThrow('Request failed')
    })
  })
})

describe('subItemsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('getByItemId', () => {
    it('fetches sub items for an item', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockSubItem],
      } as Response)

      const result = await subItemsApi.getByItemId(1)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/items/1/sub-items',
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual([mockSubItem])
    })
  })

  describe('create', () => {
    it('creates new sub item', async () => {
      const subItemData = {
        itemId: 1,
        title: 'New Sub Item',
        gltfFile: 'model.gltf'
      }
      
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubItem,
      } as Response)

      const result = await subItemsApi.create(subItemData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/sub-items',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subItemData),
        })
      )
      expect(result).toEqual(mockSubItem)
    })
  })

  describe('update', () => {
    it('updates existing sub item', async () => {
      const updateData = {
        title: 'Updated Sub Item',
        gltfFile: 'updated-model.gltf'
      }
      
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubItem,
      } as Response)

      const result = await subItemsApi.update(1, updateData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/sub-items/1',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(mockSubItem)
    })
  })

  describe('delete', () => {
    it('deletes sub item by id', async () => {
      const deleteResponse = { message: 'Sub item deleted successfully' }
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse,
      } as Response)

      const result = await subItemsApi.delete(1)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/sub-items/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toEqual(deleteResponse)
    })
  })
})

describe('Network Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles network errors gracefully', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(itemsApi.getAll()).rejects.toThrow('Network error')
  })

  it('handles timeout errors', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Request timeout'))

    await expect(authApi.login('test@example.com', 'password')).rejects.toThrow('Request timeout')
  })
})
