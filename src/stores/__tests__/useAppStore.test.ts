import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '../useAppStore'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useAppStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    useAppStore.setState({
      user: null,
      isAuthenticated: false,
      authToken: null,
      sidebarOpen: false,
      theme: 'system',
      globalSearchQuery: '',
      recentSearches: [],
      itemsPerPage: 12,
      defaultView: 'grid',
    })
  })

  describe('Authentication', () => {
    it('should initialize with unauthenticated state', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.authToken).toBeNull()
    })

    it('should login user correctly', () => {
      const { result } = renderHook(() => useAppStore())
      const mockUser = { id: 1, email: 'test@example.com' }
      const mockToken = 'mock-token'

      act(() => {
        result.current.login(mockUser, mockToken)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.authToken).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should logout user correctly', () => {
      const { result } = renderHook(() => useAppStore())
      const mockUser = { id: 1, email: 'test@example.com' }

      // First login
      act(() => {
        result.current.login(mockUser, 'token')
      })

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.authToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set user correctly', () => {
      const { result } = renderHook(() => useAppStore())
      const mockUser = { id: 1, email: 'test@example.com' }

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should set auth token correctly', () => {
      const { result } = renderHook(() => useAppStore())
      const mockToken = 'new-token'

      act(() => {
        result.current.setAuthToken(mockToken)
      })

      expect(result.current.authToken).toBe(mockToken)
    })
  })

  describe('UI State', () => {
    it('should toggle sidebar', () => {
      const { result } = renderHook(() => useAppStore())

      expect(result.current.sidebarOpen).toBe(false)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(true)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(false)
    })

    it('should set sidebar open state', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.setSidebarOpen(true)
      })

      expect(result.current.sidebarOpen).toBe(true)

      act(() => {
        result.current.setSidebarOpen(false)
      })

      expect(result.current.sidebarOpen).toBe(false)
    })

    it('should set theme', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.setTheme('dark')
      })

      expect(result.current.theme).toBe('dark')

      act(() => {
        result.current.setTheme('light')
      })

      expect(result.current.theme).toBe('light')
    })
  })

  describe('Search State', () => {
    it('should set global search query', () => {
      const { result } = renderHook(() => useAppStore())
      const query = 'test search'

      act(() => {
        result.current.setGlobalSearchQuery(query)
      })

      expect(result.current.globalSearchQuery).toBe(query)
    })

    it('should add recent search', () => {
      const { result } = renderHook(() => useAppStore())
      const search1 = 'first search'
      const search2 = 'second search'

      act(() => {
        result.current.addRecentSearch(search1)
      })

      expect(result.current.recentSearches).toEqual([search1])

      act(() => {
        result.current.addRecentSearch(search2)
      })

      expect(result.current.recentSearches).toEqual([search2, search1])
    })

    it('should not add empty search to recent searches', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRecentSearch('')
      })

      expect(result.current.recentSearches).toEqual([])

      act(() => {
        result.current.addRecentSearch('   ')
      })

      expect(result.current.recentSearches).toEqual([])
    })

    it('should limit recent searches to 10 items', () => {
      const { result } = renderHook(() => useAppStore())

      // Add 12 searches
      act(() => {
        for (let i = 1; i <= 12; i++) {
          result.current.addRecentSearch(`search ${i}`)
        }
      })

      expect(result.current.recentSearches).toHaveLength(10)
      expect(result.current.recentSearches[0]).toBe('search 12')
      expect(result.current.recentSearches[9]).toBe('search 3')
    })

    it('should clear recent searches', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRecentSearch('test')
        result.current.addRecentSearch('another test')
      })

      expect(result.current.recentSearches).toHaveLength(2)

      act(() => {
        result.current.clearRecentSearches()
      })

      expect(result.current.recentSearches).toEqual([])
    })
  })

  describe('Preferences', () => {
    it('should set items per page', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.setItemsPerPage(24)
      })

      expect(result.current.itemsPerPage).toBe(24)
    })

    it('should set default view', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.setDefaultView('list')
      })

      expect(result.current.defaultView).toBe('list')

      act(() => {
        result.current.setDefaultView('grid')
      })

      expect(result.current.defaultView).toBe('grid')
    })
  })
})
