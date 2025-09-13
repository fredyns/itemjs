import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
}

interface AppState {
  // Authentication state
  user: User | null
  isAuthenticated: boolean
  authToken: string | null
  
  // UI state
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Search and filters state
  globalSearchQuery: string
  recentSearches: string[]
  
  // Preferences
  itemsPerPage: number
  defaultView: 'grid' | 'list'
  
  // Actions
  setUser: (user: User | null) => void
  setAuthToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  setGlobalSearchQuery: (query: string) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  
  setItemsPerPage: (count: number) => void
  setDefaultView: (view: 'grid' | 'list') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      authToken: null,
      
      sidebarOpen: false,
      theme: 'system',
      
      globalSearchQuery: '',
      recentSearches: [],
      
      itemsPerPage: 12,
      defaultView: 'grid',
      
      // Authentication actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setAuthToken: (token) => set({ authToken: token }),
      
      login: (user, token) => set({
        user,
        authToken: token,
        isAuthenticated: true,
      }),
      
      logout: () => set({
        user: null,
        authToken: null,
        isAuthenticated: false,
      }),
      
      // UI actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setTheme: (theme) => set({ theme }),
      
      // Search actions
      setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
      
      addRecentSearch: (query) => {
        const trimmedQuery = query.trim()
        if (!trimmedQuery) return
        
        const { recentSearches } = get()
        const updatedSearches = [
          trimmedQuery,
          ...recentSearches.filter(search => search !== trimmedQuery)
        ].slice(0, 10) // Keep only last 10 searches
        
        set({ recentSearches: updatedSearches })
      },
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      // Preferences actions
      setItemsPerPage: (count) => set({ itemsPerPage: count }),
      
      setDefaultView: (view) => set({ defaultView: view }),
    }),
    {
      name: 'itemjs-app-store',
      partialize: (state) => ({
        // Only persist certain parts of the state
        theme: state.theme,
        recentSearches: state.recentSearches,
        itemsPerPage: state.itemsPerPage,
        defaultView: state.defaultView,
        authToken: state.authToken,
      }),
    }
  )
)
