import '@testing-library/jest-dom'

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3001'
  },
  writable: true
})

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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
})

























