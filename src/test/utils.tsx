import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

// Create a test query client with disabled retries and caching
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // Previously cacheTime - time until inactive queries are garbage collected
    },
    mutations: {
      retry: false,
    },
  },
})

// Mock router for testing
const createTestRouter = (initialEntries: string[] = ['/'], queryClient: QueryClient) => {
  const history = createMemoryHistory({
    initialEntries,
  })

  return createRouter({
    routeTree,
    history,
    context: {
      queryClient,
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  queryClient?: QueryClient
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  {
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const router = createTestRouter(initialEntries, queryClient)

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
    router,
  }
}

// Mock data for testing
export const mockItem = {
  id: 1,
  title: 'Test Item',
  slug: 'test-item',
  content: '<p>This is test content for the item.</p>',
  image: 'https://example.com/test-image.jpg',
  gltfFile: 'https://example.com/test-model.gltf',
  postedAt: '2024-01-01T00:00:00.000Z',
  viewCounts: 42,
  userId: 1,
  user: {
    id: 1,
    email: 'test@example.com'
  },
  subItems: [],
  _count: {
    subItems: 0
  }
}

export const mockSubItem = {
  id: 1,
  itemId: 1,
  title: 'Test Sub Item',
  gltfFile: 'https://example.com/test-sub-model.gltf',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  item: {
    id: 1,
    title: 'Test Item'
  }
}

export const mockPaginatedResponse = {
  items: [mockItem],
  pagination: {
    page: 1,
    limit: 12,
    total: 1,
    pages: 1
  }
}

export const mockUser = {
  id: 1,
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z'
}

export const mockAuthResponse = {
  user: mockUser,
  token: 'mock-jwt-token',
  message: 'Login successful'
}

// Mock API responses
export const mockApiResponses = {
  getItems: mockPaginatedResponse,
  getItem: mockItem,
  createItem: mockItem,
  updateItem: mockItem,
  deleteItem: { message: 'Item deleted successfully' },
  getSubItems: [mockSubItem],
  createSubItem: mockSubItem,
  updateSubItem: mockSubItem,
  deleteSubItem: { message: 'Sub item deleted successfully' },
  login: mockAuthResponse,
  register: mockAuthResponse,
  getProfile: mockUser
}

// Test utilities
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const createMockFile = (name = 'test.gltf', type = 'model/gltf+json') => 
  new File(['test content'], name, { type })

// TypeScript module declaration for router registration
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createTestRouter>
  }
}

// Re-export everything from testing library
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export { customRender as render, createTestQueryClient }

// Export createTestRouter with updated signature
export const createTestRouterExport = (initialEntries: string[] = ['/'], queryClient: QueryClient = createTestQueryClient()) => 
  createTestRouter(initialEntries, queryClient)
