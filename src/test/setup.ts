import '@testing-library/jest-dom'

// Type declarations for global object extensions
declare global {
  var importMeta: {
    meta: {
      env: {
        VITE_API_URL: string
      }
    }
  }
}

// Mock environment variables
;(global as any).importMeta = (global as any).importMeta || {}
;(global as any).importMeta.meta = (global as any).importMeta.meta || {}
;(global as any).importMeta.meta.env = {
  VITE_API_URL: 'http://localhost:3001'
}

// Mock Three.js for testing
jest.mock('three', () => ({
  Scene: jest.fn(() => ({
    add: jest.fn(),
    background: null
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    aspect: 1,
    updateProjectionMatrix: jest.fn()
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement('canvas'),
    shadowMap: {
      enabled: false,
      type: null
    }
  })),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(() => ({
    position: { set: jest.fn() },
    castShadow: false,
    shadow: {
      mapSize: { width: 0, height: 0 }
    }
  })),
  Color: jest.fn(),
  Box3: jest.fn(() => ({
    setFromObject: jest.fn(() => ({
      getCenter: jest.fn(() => ({ multiplyScalar: jest.fn() })),
      getSize: jest.fn(() => ({ x: 1, y: 1, z: 1 }))
    }))
  })),
  Vector3: jest.fn(() => ({
    subVectors: jest.fn(),
    multiplyScalar: jest.fn(),
    copy: jest.fn(() => ({ add: jest.fn() }))
  })),
  Mesh: jest.fn(),
  PCFSoftShadowMap: 'PCFSoftShadowMap'
}))

// Mock Three.js addons
jest.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn(() => ({
    load: jest.fn((_url, onLoad, _onProgress, _onError) => {
      // Simulate successful load
      setTimeout(() => {
        onLoad({
          scene: {
            scale: { multiplyScalar: jest.fn() },
            position: { sub: jest.fn() },
            traverse: jest.fn()
          }
        })
      }, 100)
    })
  }))
}))

jest.mock('three/addons/controls/OrbitControls.js', () => ({
  OrbitControls: jest.fn(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    screenSpacePanning: false,
    minDistance: 1,
    maxDistance: 100,
    target: { x: 0, y: 0, z: 0 },
    update: jest.fn(),
    dispose: jest.fn()
  }))
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})

global.cancelAnimationFrame = jest.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage with auth token
const localStorageMock = {
  getItem: jest.fn((key) => {
    if (key === 'auth_token') {
      return 'mock-jwt-token'
    }
    return null
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock AuthContext to provide authenticated user by default
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    token: 'mock-jwt-token',
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    isAuthenticated: true,
  })
}))

// Mock TanStack Router components to avoid router dependencies
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Link: ({ children, to, ...props }: any) => {
    const React = require('react');
    return React.createElement('a', { href: to, ...props }, children);
  },
  useRouterState: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    navigate: jest.fn(),
    state: { location: { pathname: '/' } }
  })),
  useNavigate: jest.fn(() => jest.fn()),
}))

// Mock API calls for AuthProvider
jest.mock('../lib/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn().mockResolvedValue({
      user: {
        id: 1,
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    })
  },
  itemsApi: {
    getAll: jest.fn().mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 }
    }),
    getItems: jest.fn().mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 }
    }),
    getItem: jest.fn().mockResolvedValue({
      id: 1,
      title: 'Test Item',
      content: 'Test content',
      createdAt: '2024-01-01T00:00:00.000Z'
    }),
    createItem: jest.fn().mockResolvedValue({
      id: 1,
      title: 'New Item',
      content: 'New content',
      createdAt: '2024-01-01T00:00:00.000Z'
    }),
    updateItem: jest.fn().mockResolvedValue({
      id: 1,
      title: 'Updated Item',
      content: 'Updated content',
      createdAt: '2024-01-01T00:00:00.000Z'
    }),
    deleteItem: jest.fn().mockResolvedValue({ success: true })
  }
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
})

























