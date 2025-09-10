const API_BASE_URL = 'http://localhost:3001/api'

export interface User {
  id: number
  email: string
  createdAt: string
}

export interface Item {
  id: number
  title: string
  slug: string
  gltfFile?: string
  content?: string
  postedAt: string
  image?: string
  viewCounts: number
  userId: number
  user: Pick<User, 'id' | 'email'>
  subItems?: SubItem[]
  _count?: {
    subItems: number
  }
}

export interface SubItem {
  id: number
  itemId: number
  title: string
  gltfFile: string
  createdAt: string
  updatedAt: string
  item?: Pick<Item, 'id' | 'title'>
}

export interface AuthResponse {
  user: User
  token: string
  message: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string, public cause?: Error) {
    super(message)
    this.name = 'ApiError'
  }
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new ApiError(response.status, errorData.error || 'Request failed')
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Network error', error as Error)
  }
}

// Auth API
export const authApi = {
  register: (email: string, password: string): Promise<AuthResponse> =>
    makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string): Promise<AuthResponse> =>
    makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (): Promise<{ user: User }> =>
    makeRequest('/auth/me'),
}

// Items API
export const itemsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Item>> => {
    // Filter out undefined values to prevent "undefined" strings in URL
    const filteredParams: Record<string, string> = {}
    if (params?.page !== undefined) filteredParams.page = params.page.toString()
    if (params?.limit !== undefined) filteredParams.limit = params.limit.toString()
    if (params?.search !== undefined && params.search !== '') filteredParams.search = params.search
    
    return makeRequest(`/items?${new URLSearchParams(filteredParams).toString()}`)
  },

  getById: (id: number): Promise<{ item: Item }> =>
    makeRequest(`/items/${id}`),

  getBySlug: (slug: string): Promise<{ item: Item }> =>
    makeRequest(`/items/${slug}`),

  create: (data: {
    title: string
    content?: string
    gltfFile?: string
    image?: string
  }): Promise<{ item: Item; message: string }> =>
    makeRequest('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: {
    title?: string
    content?: string
    gltfFile?: string
    image?: string
  }): Promise<{ item: Item; message: string }> =>
    makeRequest(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    makeRequest(`/items/${id}`, {
      method: 'DELETE',
    }),
}

// Sub-items API
export const subItemsApi = {
  getByItemId: (itemId: number): Promise<{ subItems: SubItem[] }> =>
    makeRequest(`/sub-items/item/${itemId}`),

  getById: (id: number): Promise<{ subItem: SubItem }> =>
    makeRequest(`/sub-items/${id}`),

  create: (data: {
    itemId: number
    title: string
    gltfFile: string
  }): Promise<{ subItem: SubItem; message: string }> =>
    makeRequest('/sub-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: {
    title?: string
    gltfFile?: string
  }): Promise<{ subItem: SubItem; message: string }> =>
    makeRequest(`/sub-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    makeRequest(`/sub-items/${id}`, {
      method: 'DELETE',
    }),
}

// Upload API
export const uploadApi = {
  uploadFile: async (file: File): Promise<{
    filename: string
    url: string
    originalName: string
    size: number
    message: string
  }> => {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new ApiError(response.status, errorData.error || 'Upload failed')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Network error', error as Error)
    }
  },
}
