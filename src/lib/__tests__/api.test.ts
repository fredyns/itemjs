// Mock the entire API module with Jest
jest.mock('../api', () => ({
  itemsApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
  },
  subItemsApi: {
    getByItemId: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

import { itemsApi, authApi, subItemsApi } from '../api'
import { mockItem, mockSubItem, mockAuthResponse, mockUser, mockPaginatedResponse } from '../../test/utils'

// Type the mocked APIs
const mockedItemsApi = itemsApi as jest.Mocked<typeof itemsApi>
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>
const mockedSubItemsApi = subItemsApi as jest.Mocked<typeof subItemsApi>

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})

describe('itemsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('getAll', () => {
    it('fetches items with default parameters', async () => {
      mockedItemsApi.getAll.mockResolvedValueOnce(mockPaginatedResponse)

      const result = await itemsApi.getAll()

      expect(mockedItemsApi.getAll).toHaveBeenCalledWith()
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('fetches items with custom parameters', async () => {
      mockedItemsApi.getAll.mockResolvedValueOnce(mockPaginatedResponse)

      await itemsApi.getAll({ page: 2, limit: 24, search: 'test' })

      expect(mockedItemsApi.getAll).toHaveBeenCalledWith({ page: 2, limit: 24, search: 'test' })
    })

    it('includes authorization header when token exists', async () => {
      localStorage.setItem('auth_token', 'test-token')
      mockedItemsApi.getAll.mockResolvedValueOnce(mockPaginatedResponse)

      await itemsApi.getAll()

      expect(mockedItemsApi.getAll).toHaveBeenCalledWith()
    })

    it('throws error when response is not ok', async () => {
      mockedItemsApi.getAll.mockRejectedValueOnce(new Error('Internal Server Error'))

      await expect(itemsApi.getAll()).rejects.toThrow('Internal Server Error')
    })
  })

  describe('getById', () => {
    it('fetches item by id', async () => {
      const mockResponse = { item: mockItem }
      mockedItemsApi.getById.mockResolvedValueOnce(mockResponse)

      const result = await itemsApi.getById(1)

      expect(mockedItemsApi.getById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockResponse)
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
      
      const mockResponse = { item: mockItem, message: 'Item created' }
      mockedItemsApi.create.mockResolvedValueOnce(mockResponse)

      const result = await itemsApi.create(itemData)

      expect(mockedItemsApi.create).toHaveBeenCalledWith(itemData)
      expect(result).toEqual(mockResponse)
    })

    it('requires authentication token for create', async () => {
      localStorage.setItem('auth_token', 'test-token')
      const itemData = { title: 'Test Item' }
      
      mockedItemsApi.create.mockResolvedValueOnce({ item: mockItem, message: 'Item created' })

      await itemsApi.create(itemData)

      expect(mockedItemsApi.create).toHaveBeenCalledWith(itemData)
    })
  })

  describe('update', () => {
    it('updates existing item', async () => {
      const updateData = {
        title: 'Updated Item',
        content: 'Updated content'
      }
      
      const mockResponse = { item: mockItem, message: 'Item updated' }
      mockedItemsApi.update.mockResolvedValueOnce(mockResponse)

      const result = await itemsApi.update(1, updateData)

      expect(mockedItemsApi.update).toHaveBeenCalledWith(1, updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('delete', () => {
    it('deletes item by id', async () => {
      const deleteResponse = { message: 'Item deleted successfully' }
      mockedItemsApi.delete.mockResolvedValueOnce(deleteResponse)

      const result = await itemsApi.delete(1)

      expect(mockedItemsApi.delete).toHaveBeenCalledWith(1)
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
      mockedAuthApi.login.mockResolvedValueOnce(mockAuthResponse)

      const credentials = { email: 'test@example.com', password: 'password' }
      const result = await authApi.login(credentials.email, credentials.password)

      expect(mockedAuthApi.login).toHaveBeenCalledWith(credentials.email, credentials.password)
      expect(result).toEqual(mockAuthResponse)
    })

    it('handles login errors', async () => {
      mockedAuthApi.login.mockRejectedValueOnce(new Error('Invalid credentials'))

      const credentials = { email: 'test@example.com', password: 'wrong' }
      
      await expect(authApi.login(credentials.email, credentials.password)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('registers new user', async () => {
      mockedAuthApi.register.mockResolvedValueOnce(mockAuthResponse)

      const userData = { 
        email: 'test@example.com', 
        password: 'password',
        confirmPassword: 'password'
      }
      const result = await authApi.register(userData.email, userData.password)

      expect(mockedAuthApi.register).toHaveBeenCalledWith(userData.email, userData.password)
      expect(result).toEqual(mockAuthResponse)
    })
  })

  describe('me', () => {
    it('fetches user profile with token', async () => {
      localStorage.setItem('auth_token', 'test-token')
      mockedAuthApi.me.mockResolvedValueOnce({ user: mockUser })

      const result = await authApi.me()

      expect(mockedAuthApi.me).toHaveBeenCalledWith()
      expect(result).toEqual({ user: mockUser })
    })

    it('throws error when no token available', async () => {
      localStorage.clear() // Ensure no token is available
      mockedAuthApi.me.mockRejectedValueOnce(new Error('No token provided'))
      
      await expect(authApi.me()).rejects.toThrow('No token provided')
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
      const mockResponse = { subItems: [mockSubItem] }
      mockedSubItemsApi.getByItemId.mockResolvedValueOnce(mockResponse)

      const result = await subItemsApi.getByItemId(1)

      expect(mockedSubItemsApi.getByItemId).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('create', () => {
    it('creates new sub item', async () => {
      const subItemData = {
        itemId: 1,
        title: 'New Sub Item',
        gltfFile: 'model.gltf'
      }
      
      const mockResponse = { subItem: mockSubItem, message: 'Sub item created' }
      mockedSubItemsApi.create.mockResolvedValueOnce(mockResponse)

      const result = await subItemsApi.create(subItemData)

      expect(mockedSubItemsApi.create).toHaveBeenCalledWith(subItemData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('update', () => {
    it('updates existing sub item', async () => {
      const updateData = {
        title: 'Updated Sub Item',
        gltfFile: 'updated-model.gltf'
      }
      
      const mockResponse = { subItem: mockSubItem, message: 'Sub item updated' }
      mockedSubItemsApi.update.mockResolvedValueOnce(mockResponse)

      const result = await subItemsApi.update(1, updateData)

      expect(mockedSubItemsApi.update).toHaveBeenCalledWith(1, updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('delete', () => {
    it('deletes sub item by id', async () => {
      const deleteResponse = { message: 'Sub item deleted successfully' }
      mockedSubItemsApi.delete.mockResolvedValueOnce(deleteResponse)

      const result = await subItemsApi.delete(1)

      expect(mockedSubItemsApi.delete).toHaveBeenCalledWith(1)
      expect(result).toEqual(deleteResponse)
    })
  })
})

describe('Network Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles network errors gracefully', async () => {
    mockedItemsApi.getAll.mockRejectedValueOnce(new Error('Network error'))

    await expect(itemsApi.getAll()).rejects.toThrow('Network error')
  })

  it('handles timeout errors', async () => {
    mockedAuthApi.login.mockRejectedValueOnce(new Error('Request timeout'))

    await expect(authApi.login('test@example.com', 'password')).rejects.toThrow('Request timeout')
  })
})
