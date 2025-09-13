# React Best Practices Implementation Guide

This document outlines the React best practices implemented in the ItemJS application and provides examples of how to use the new components, hooks, and utilities.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Custom Hooks](#custom-hooks)
3. [State Management with Zustand](#state-management-with-zustand)
4. [Security Utilities](#security-utilities)
5. [Lazy Loading and Code Splitting](#lazy-loading-and-code-splitting)
6. [Performance Monitoring](#performance-monitoring)
7. [Testing Best Practices](#testing-best-practices)

## Component Architecture

### Decomposed Components

We've broken down large components into smaller, focused components for better maintainability and reusability.

#### ItemsSearch Component

```tsx
import { ItemsSearch } from '../components/items/ItemsSearch'

function MyPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query)
    // Perform search logic
  }
  
  return (
    <ItemsSearch
      searchQuery={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      onSearchSubmit={handleSearchSubmit}
      onClearSearch={() => setSearchQuery('')}
    />
  )
}
```

#### ItemsPagination Component

```tsx
import { ItemsPagination } from '../components/items/ItemsPagination'

function MyPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10
  const totalItems = 100
  const itemsPerPage = 10
  
  return (
    <ItemsPagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
      onNextPage={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
    />
  )
}
```

### Secure Form Component

```tsx
import { SecureForm } from '../components/forms/SecureForm'

function LoginPage() {
  const fields = [
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'password', label: 'Password', type: 'password' as const, required: true }
  ]
  
  const handleSubmit = async (data: Record<string, string>) => {
    // Handle form submission with sanitized data
    console.log('Sanitized form data:', data)
  }
  
  return (
    <SecureForm
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Sign In"
    />
  )
}
```

## Custom Hooks

### useSearch Hook

```tsx
import { useSearch } from '../hooks/useSearch'

function SearchableComponent() {
  const { searchQuery, setSearchQuery, handleSearchChange, clearSearch } = useSearch()
  
  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      <button onClick={clearSearch}>Clear</button>
      <p>Current search: {searchQuery}</p>
    </div>
  )
}
```

### usePagination Hook

```tsx
import { usePagination } from '../hooks/usePagination'

function PaginatedList() {
  const { 
    currentPage, 
    setCurrentPage, 
    goToPage, 
    goToNextPage, 
    goToPrevPage 
  } = usePagination()
  
  return (
    <div>
      <p>Current page: {currentPage}</p>
      <button onClick={goToPrevPage}>Previous</button>
      <button onClick={() => goToPage(5)}>Go to page 5</button>
      <button onClick={goToNextPage}>Next</button>
    </div>
  )
}
```

### useLocalStorage Hook

```tsx
import { useLocalStorage } from '../hooks/useLocalStorage'

function PreferencesComponent() {
  const { 
    getItem, 
    setItem, 
    removeItem, 
    exists 
  } = useLocalStorage()
  
  const savePreference = (key: string, value: string) => {
    setItem(key, value)
  }
  
  const loadPreference = (key: string) => {
    return getItem(key)
  }
  
  return (
    <div>
      <button onClick={() => savePreference('theme', 'dark')}>
        Save Dark Theme
      </button>
      <button onClick={() => console.log(loadPreference('theme'))}>
        Load Theme
      </button>
    </div>
  )
}
```

### useLazyLoad Hook

```tsx
import { useLazyLoad } from '../hooks/useLazyLoad'

function LazyComponent() {
  const { isIntersecting, ref, shouldLoad } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  })
  
  return (
    <div ref={ref}>
      {shouldLoad ? (
        <ExpensiveComponent />
      ) : (
        <div>Loading placeholder...</div>
      )}
    </div>
  )
}
```

## State Management with Zustand

### Using the App Store

```tsx
import { useAppStore } from '../stores/useAppStore'

function Header() {
  const { 
    user, 
    isAuthenticated, 
    sidebarOpen, 
    toggleSidebar,
    theme,
    setTheme 
  } = useAppStore()
  
  return (
    <header>
      <button onClick={toggleSidebar}>
        {sidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>
      
      <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      
      {isAuthenticated ? (
        <span>Welcome, {user?.email}</span>
      ) : (
        <button>Sign In</button>
      )}
    </header>
  )
}
```

### Authentication Actions

```tsx
import { useAppStore } from '../stores/useAppStore'

function LoginForm() {
  const { login, logout } = useAppStore()
  
  const handleLogin = async (email: string, password: string) => {
    try {
      // Authenticate user
      const response = await authApi.login({ email, password })
      login(response.user, response.token)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  
  const handleLogout = () => {
    logout()
  }
  
  return (
    <div>
      {/* Login form JSX */}
    </div>
  )
}
```

## Security Utilities

### Input Sanitization

```tsx
import { 
  sanitizeText, 
  sanitizeHtml, 
  sanitizeEmail,
  validators 
} from '../utils/security'

function UserForm() {
  const handleSubmit = (formData: FormData) => {
    // Sanitize inputs
    const name = sanitizeText(formData.get('name') as string)
    const email = sanitizeEmail(formData.get('email') as string)
    const bio = sanitizeHtml(formData.get('bio') as string)
    
    // Validate inputs
    if (!validators.email(email)) {
      throw new Error('Invalid email')
    }
    
    // Process sanitized data
    console.log({ name, email, bio })
  }
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(new FormData(e.currentTarget))
    }}>
      {/* Form fields */}
    </form>
  )
}
```

### Rate Limiting

```tsx
import { rateLimiter } from '../utils/security'

function ApiComponent() {
  const makeRequest = async () => {
    const userId = 'user-123'
    
    if (!rateLimiter.isAllowed(userId)) {
      alert('Too many requests. Please wait.')
      return
    }
    
    // Make API request
    try {
      const response = await fetch('/api/data')
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error('Request failed:', error)
    }
  }
  
  return (
    <button onClick={makeRequest}>
      Make Request
    </button>
  )
}
```

## Lazy Loading and Code Splitting

### Using Lazy Components

```tsx
import { ThreeViewerLazy } from '../components/LazyComponents'

function ItemDetail() {
  return (
    <div>
      <h1>Item Details</h1>
      {/* This component will be lazy loaded */}
      <ThreeViewerLazy modelUrl="/models/item.glb" />
    </div>
  )
}
```

### Route-based Code Splitting

```tsx
import { lazy, Suspense } from 'react'
import { ItemsGridSkeleton } from '../components/ui/skeleton'

const LazyItemsPage = lazy(() => import('../pages/ItemsIndex'))

function App() {
  return (
    <Router>
      <Route path="/items" element={
        <Suspense fallback={<ItemsGridSkeleton count={12} />}>
          <LazyItemsPage />
        </Suspense>
      } />
    </Router>
  )
}
```

## Performance Monitoring

### Using Performance Monitor

```tsx
import { performanceMonitor, withPerformanceTracking } from '../utils/performance'

// Wrap component with performance tracking
const TrackedComponent = withPerformanceTracking(MyComponent, 'MyComponent')

// Manual performance measurement
function ExpensiveOperation() {
  const handleOperation = async () => {
    performanceMonitor.startMeasure('expensive-operation')
    
    try {
      // Perform expensive operation
      await heavyComputation()
    } finally {
      performanceMonitor.endMeasure('expensive-operation')
    }
  }
  
  return <button onClick={handleOperation}>Start Operation</button>
}
```

### Core Web Vitals

```tsx
import { initCoreWebVitals, monitorMemoryUsage } from '../utils/performance'

function App() {
  useEffect(() => {
    // Initialize Core Web Vitals monitoring
    initCoreWebVitals()
    
    // Monitor memory usage periodically
    const interval = setInterval(monitorMemoryUsage, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  return <div>{/* App content */}</div>
}
```

## Testing Best Practices

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemsSearch } from '../ItemsSearch'

describe('ItemsSearch', () => {
  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn()
    
    render(
      <ItemsSearch
        searchQuery=""
        onSearchChange={jest.fn()}
        onSearchSubmit={mockOnSubmit}
        onClearSearch={jest.fn()}
      />
    )
    
    const input = screen.getByPlaceholderText('Search items...')
    await user.type(input, 'test query')
    
    const submitButton = screen.getByRole('button', { name: /search/i })
    await user.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalledWith('test query')
  })
})
```

### Hook Testing

```tsx
import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../useSearch'

describe('useSearch', () => {
  it('should manage search state', () => {
    const { result } = renderHook(() => useSearch())
    
    expect(result.current.searchQuery).toBe('')
    
    act(() => {
      result.current.setSearchQuery('test')
    })
    
    expect(result.current.searchQuery).toBe('test')
  })
})
```

### Store Testing

```tsx
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '../useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      user: null,
      isAuthenticated: false,
      // ... other initial state
    })
  })
  
  it('should handle authentication', () => {
    const { result } = renderHook(() => useAppStore())
    const mockUser = { id: 1, email: 'test@example.com' }
    
    act(() => {
      result.current.login(mockUser, 'token')
    })
    
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

## Best Practices Summary

1. **Component Decomposition**: Break large components into smaller, focused ones
2. **Custom Hooks**: Extract reusable logic into custom hooks
3. **State Management**: Use Zustand for a complex client state
4. **Security**: Always sanitize user inputs and validate data
5. **Performance**: Use lazy loading, memoization, and performance monitoring
6. **Testing**: Write comprehensive tests for components, hooks, and utilities
7. **Accessibility**: Include proper ARIA attributes and keyboard navigation
8. **Type Safety**: Use TypeScript for better development experience

## Migration Guide

When migrating existing components to use these best practices:

1. **Identify Large Components**: Look for components with >200 lines
2. **Extract Logic**: Move reusable logic to custom hooks
3. **Add Security**: Implement input sanitization where needed
4. **Add Tests**: Write tests for new components and hooks
5. **Performance**: Add lazy loading for heavy components
6. **Accessibility**: Ensure proper ARIA attributes and keyboard navigation

This implementation provides a solid foundation for a maintainable, secure, and performant React application following industry best practices.
