# 17 - Automated Testing: Building Reliable React Applications

## 🎯 Learning Goals
- Master automated testing strategies for React applications
- Learn component testing, API testing, and integration testing
- Understand testing tools: Jest, React Testing Library, and testing utilities
- Compare React testing approaches with Laravel testing patterns
- Implement comprehensive test coverage for your ItemJS application

## 📚 Why Automated Testing Matters

**Automated testing** ensures your React application works correctly and continues to work as you make changes. Just like Laravel has PHPUnit for backend testing, React uses Jest and React Testing Library for frontend testing.

### 🔄 **Laravel vs React Testing Comparison**

| Laravel Testing | React Testing | Purpose |
|----------------|---------------|---------|
| PHPUnit | Jest | Test runner and framework |
| Feature Tests | Integration Tests | End-to-end functionality |
| Unit Tests | Component Tests | Individual units |
| HTTP Tests | API Tests | API endpoint testing |
| Database Factories | Mock Data | Test data generation |
| Assertions | Matchers | Test expectations |

## 🏗️ **Testing Architecture in ItemJS**

Your ItemJS application already has a robust testing setup. Let's explore the structure:

### **1. Testing Configuration**
*Reference: [`jest.config.js`](../jest.config.js)*

```javascript
// jest.config.js - Your actual configuration
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

**Laravel Equivalent:**
```php
// phpunit.xml
<phpunit>
    <testsuites>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

### **2. Test Setup and Utilities**
*Reference: [`src/test/setup.ts`](../src/test/setup.ts)*

```typescript
// Your actual test setup includes:
import '@testing-library/jest-dom'

// Mock Three.js for testing
jest.mock('three', () => ({
  Scene: jest.fn(() => ({ add: jest.fn(), background: null })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn()
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement('canvas')
  }))
}))

// Mock environment variables
global.importMeta = {
  meta: { env: { VITE_API_URL: 'http://localhost:3001' } }
}
```

## 🧩 **Component Testing Strategies**

### **1. Testing Complex Components**
*Reference: [`src/components/__tests__/ThreeViewer.test.tsx`](../src/components/__tests__/ThreeViewer.test.tsx)*

Your ThreeViewer component test demonstrates advanced testing patterns:

```typescript
// Example from your actual ThreeViewer test
import React from 'react'
import { render, screen, waitFor } from '../../test/utils'
import { ThreeViewer } from '../ThreeViewer'
import userEvent from '@testing-library/user-event'

// Mock complex dependencies
jest.mock('three', () => ({
  Scene: jest.fn(() => ({ add: jest.fn(), background: null })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn()
  }))
}))

describe('ThreeViewer', () => {
  it('renders 3D viewer with controls', async () => {
    render(<ThreeViewer modelUrl="/test-model.glb" />)
    
    // Test that the component renders
    expect(screen.getByTestId('three-viewer')).toBeInTheDocument()
    
    // Test loading state
    expect(screen.getByText('Loading 3D model...')).toBeInTheDocument()
    
    // Wait for model to load
    await waitFor(() => {
      expect(screen.queryByText('Loading 3D model...')).not.toBeInTheDocument()
    })
  })
})
```

**Laravel Equivalent:**
```php
// tests/Feature/ItemTest.php
class ItemTest extends TestCase
{
    public function test_item_page_displays_correctly()
    {
        $item = Item::factory()->create(['title' => 'Test Item']);
        
        $response = $this->get("/items/{$item->slug}");
        
        $response->assertStatus(200);
        $response->assertSee('Test Item');
        $response->assertViewIs('items.show');
    }
}
```

### **2. Testing Form Components**
Building on concepts from [**08-building-crud-app.md**](./08-building-crud-app.md):

```typescript
// Testing form validation and submission
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemForm } from '../forms/ItemForm'

describe('ItemForm', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn()
    
    render(<ItemForm onSubmit={mockOnSubmit} />)
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)
    
    // Check validation errors
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
  
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn()
    
    render(<ItemForm onSubmit={mockOnSubmit} />)
    
    // Fill form fields
    await user.type(screen.getByLabelText(/title/i), 'Test Item')
    await user.type(screen.getByLabelText(/description/i), 'Test description')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    // Verify submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Item',
        description: 'Test description'
      })
    })
  })
})
```

### **3. Testing with React Query**
Building on concepts from [**13-tanstack-query.md**](./13-tanstack-query.md):

```typescript
// Testing components that use React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { ItemsList } from '../ItemsList'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const renderWithQueryClient = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('ItemsList', () => {
  it('displays loading state initially', () => {
    renderWithQueryClient(<ItemsList />)
    expect(screen.getByText('Loading items...')).toBeInTheDocument()
  })
  
  it('displays items after loading', async () => {
    // Mock API response
    jest.mocked(itemsApi.getAll).mockResolvedValueOnce({
      items: [
        { id: 1, title: 'Item 1', slug: 'item-1' },
        { id: 2, title: 'Item 2', slug: 'item-2' }
      ],
      pagination: { page: 1, limit: 12, total: 2, pages: 1 }
    })
    
    renderWithQueryClient(<ItemsList />)
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })
})
```

## 🔌 **API Testing**

### **1. Testing API Functions**
*Reference: [`src/lib/__tests__/api.test.ts`](../src/lib/__tests__/api.test.ts)*

Your API tests demonstrate proper mocking and testing patterns:

```typescript
// Example from your actual API tests
import { itemsApi, authApi } from '../api'
import { mockItem, mockPaginatedResponse } from '../../test/utils'

// Mock the entire API module
jest.mock('../api', () => ({
  itemsApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}))

describe('itemsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('fetches items with default parameters', async () => {
      const mockedItemsApi = itemsApi as jest.Mocked<typeof itemsApi>
      mockedItemsApi.getAll.mockResolvedValueOnce(mockPaginatedResponse)

      const result = await itemsApi.getAll()

      expect(mockedItemsApi.getAll).toHaveBeenCalledWith()
      expect(result).toEqual(mockPaginatedResponse)
    })
  })
})
```

**Laravel Equivalent:**
```php
// tests/Feature/Api/ItemApiTest.php
class ItemApiTest extends TestCase
{
    public function test_get_items_returns_paginated_response()
    {
        Item::factory()->count(5)->create();
        
        $response = $this->getJson('/api/items');
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'items' => [
                        '*' => ['id', 'title', 'slug', 'created_at']
                    ],
                    'pagination' => ['page', 'limit', 'total', 'pages']
                ]);
    }
}
```

### **2. Testing Authentication**
Building on concepts from [**05-api-integration.md**](./05-api-integration.md):

```typescript
// Testing authentication flows
describe('authApi', () => {
  it('stores token after successful login', async () => {
    const mockResponse = {
      user: { id: 1, email: 'test@example.com' },
      token: 'mock-jwt-token'
    }
    
    jest.mocked(authApi.login).mockResolvedValueOnce(mockResponse)
    
    const result = await authApi.login('test@example.com', 'password')
    
    expect(result).toEqual(mockResponse)
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token')
  })
  
  it('handles login failure', async () => {
    const mockError = new Error('Invalid credentials')
    jest.mocked(authApi.login).mockRejectedValueOnce(mockError)
    
    await expect(authApi.login('test@example.com', 'wrong-password'))
      .rejects.toThrow('Invalid credentials')
  })
})
```

## 🎣 **Testing Custom Hooks**

### **1. Testing Data Fetching Hooks**
```typescript
// Testing custom hooks that use React Query
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useItemsQuery } from '../hooks/useItemsQuery'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useItemsQuery', () => {
  it('fetches items successfully', async () => {
    const mockItems = [{ id: 1, title: 'Test Item' }]
    jest.mocked(itemsApi.getAll).mockResolvedValueOnce({
      items: mockItems,
      pagination: { page: 1, limit: 12, total: 1, pages: 1 }
    })
    
    const { result } = renderHook(
      () => useItemsQuery({ page: 1 }),
      { wrapper: createWrapper() }
    )
    
    await waitFor(() => {
      expect(result.current.data?.items).toEqual(mockItems)
      expect(result.current.isLoading).toBe(false)
    })
  })
})
```

### **2. Testing State Management Hooks**
Building on concepts from [**04-state-management.md**](./04-state-management.md):

```typescript
// Testing custom state hooks
import { renderHook, act } from '@testing-library/react'
import { useItemForm } from '../hooks/useItemForm'

describe('useItemForm', () => {
  it('manages form state correctly', () => {
    const { result } = renderHook(() => useItemForm())
    
    expect(result.current.values).toEqual({
      title: '',
      description: '',
      price: 0
    })
    
    act(() => {
      result.current.setValue('title', 'New Item')
    })
    
    expect(result.current.values.title).toBe('New Item')
  })
  
  it('validates form data', () => {
    const { result } = renderHook(() => useItemForm())
    
    act(() => {
      result.current.validate()
    })
    
    expect(result.current.errors.title).toBe('Title is required')
  })
})
```

## 🛡️ **Error Boundary Testing**

### **1. Testing Error Boundaries**
*Reference: [`src/components/__tests__/ErrorBoundary.test.tsx`](../src/components/__tests__/ErrorBoundary.test.tsx)*

```typescript
// Testing error boundaries
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
  
  it('renders error fallback when there is an error', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })
})
```

## 🎨 **Testing UI Components**

### **1. Testing shadcn/ui Components**
Building on concepts from [**14-shadcn-ui.md**](./14-shadcn-ui.md):

```typescript
// Testing UI components with proper accessibility
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'

describe('Button', () => {
  it('renders with correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')
  })
  
  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button', { name: /click me/i }))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('Dialog', () => {
  it('opens and closes correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>This is a test dialog</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    
    // Dialog should be closed initially
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
    
    // Open dialog
    await user.click(screen.getByRole('button', { name: /open dialog/i }))
    
    // Dialog should be open
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    
    // Close dialog with Escape key
    await user.keyboard('{Escape}')
    
    // Dialog should be closed
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
  })
})
```

## 🚀 **Integration Testing**

### **1. Testing Complete User Flows**
```typescript
// Testing complete user workflows
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ItemsIndex } from '../pages/ItemsIndex'

describe('ItemsIndex Integration', () => {
  it('allows user to create a new item', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    
    // Mock successful API calls
    jest.mocked(itemsApi.getAll).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 }
    })
    
    jest.mocked(itemsApi.create).mockResolvedValue({
      id: 1,
      title: 'New Item',
      description: 'New description',
      slug: 'new-item',
      createdAt: '2024-01-01T00:00:00.000Z'
    })
    
    render(
      <QueryClientProvider client={queryClient}>
        <ItemsIndex />
      </QueryClientProvider>
    )
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    // Click create button
    await user.click(screen.getByRole('button', { name: /create item/i }))
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'New Item')
    await user.type(screen.getByLabelText(/description/i), 'New description')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    // Verify API was called
    await waitFor(() => {
      expect(itemsApi.create).toHaveBeenCalledWith({
        title: 'New Item',
        description: 'New description'
      })
    })
    
    // Verify success message
    expect(screen.getByText(/item created successfully/i)).toBeInTheDocument()
  })
})
```

## 📊 **Test Coverage and Quality**

### **1. Coverage Reports**
Your Jest configuration includes coverage thresholds:

```javascript
// From your jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

**Running Coverage:**
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### **2. Testing Best Practices**

**✅ Good Testing Practices:**
```typescript
// Clear, descriptive test names
describe('ItemCard component', () => {
  it('displays item title and description correctly', () => {
    // Test implementation
  })
  
  it('calls onEdit callback when edit button is clicked', () => {
    // Test implementation
  })
})

// Use data-testid for complex queries
render(<ItemCard item={mockItem} data-testid="item-card-1" />)
expect(screen.getByTestId('item-card-1')).toBeInTheDocument()

// Test user interactions, not implementation details
await user.click(screen.getByRole('button', { name: /edit/i }))
expect(mockOnEdit).toHaveBeenCalledWith(mockItem)
```

**❌ Avoid These Patterns:**
```typescript
// Don't test implementation details
expect(component.state.isLoading).toBe(false) // Bad

// Don't use fragile selectors
expect(container.querySelector('.item-card > div > span')).toBeInTheDocument() // Bad

// Don't test third-party libraries
expect(queryClient.getQueryData).toHaveBeenCalled() // Bad
```

## 🔧 **Testing Tools and Utilities**

### **1. Custom Test Utilities**
*Reference: [`src/test/utils.tsx`](../src/test/utils.tsx)*

```typescript
// Your actual test utilities
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../contexts/AuthContext'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data factories
export const mockItem = {
  id: 1,
  title: 'Test Item',
  description: 'Test description',
  slug: 'test-item',
  createdAt: '2024-01-01T00:00:00.000Z'
}

export const mockPaginatedResponse = {
  items: [mockItem],
  pagination: { page: 1, limit: 12, total: 1, pages: 1 }
}
```

### **2. Running Tests**

**Available Test Commands:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ThreeViewer.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

## 🎯 **Key Takeaways**

### **React vs Laravel Testing:**

1. **Test Structure**: Component tests vs Feature/Unit tests
2. **Mocking**: Jest mocks vs Laravel fakes
3. **Assertions**: React Testing Library vs PHPUnit assertions
4. **Test Data**: Mock objects vs Factories
5. **Environment**: jsdom vs HTTP tests

### **Essential Testing Practices:**
- ✅ **Test user interactions**, not implementation details
- ✅ **Mock external dependencies** (APIs, libraries)
- ✅ **Use descriptive test names** and organize with describe blocks
- ✅ **Test error states** and edge cases
- ✅ **Maintain good coverage** but focus on critical paths
- ✅ **Write tests alongside development**, not after

### **Common Testing Pitfalls:**
- ❌ **Testing implementation details** instead of behavior
- ❌ **Fragile selectors** that break with UI changes
- ❌ **Not mocking external dependencies** properly
- ❌ **Over-testing** simple components
- ❌ **Under-testing** complex user flows

## 🚀 **Implementation Checklist**

### **Setting Up Testing:**
- [ ] Configure Jest and React Testing Library
- [ ] Set up test utilities and providers
- [ ] Create mock data factories
- [ ] Configure coverage thresholds

### **Writing Tests:**
- [ ] Test critical user flows
- [ ] Test error boundaries and error states
- [ ] Test form validation and submission
- [ ] Test API integration points
- [ ] Test custom hooks and utilities

### **Maintaining Tests:**
- [ ] Run tests in CI/CD pipeline
- [ ] Monitor coverage reports
- [ ] Update tests when features change
- [ ] Refactor tests to avoid duplication

## 💡 **Next Steps**

After mastering automated testing:
1. **Set up continuous integration** - Run tests on every commit
2. **Add end-to-end testing** - Cypress or Playwright for full user flows
3. **Performance testing** - Test component render times
4. **Visual regression testing** - Catch UI changes automatically
5. **Accessibility testing** - Automated a11y checks

## 📚 **Cross-References**

This tutorial builds upon concepts from:
- [**02-react-fundamentals.md**](./02-react-fundamentals.md) - Component testing basics
- [**04-state-management.md**](./04-state-management.md) - Testing state and hooks
- [**05-api-integration.md**](./05-api-integration.md) - API testing patterns
- [**08-building-crud-app.md**](./08-building-crud-app.md) - Integration testing
- [**13-tanstack-query.md**](./13-tanstack-query.md) - Testing React Query
- [**14-shadcn-ui.md**](./14-shadcn-ui.md) - UI component testing
- [**16-best-practices.md**](./16-best-practices.md) - Testing best practices

## 🔗 **Reference Files**

Explore these actual test files in your ItemJS project:
- [`jest.config.js`](../jest.config.js) - Jest configuration
- [`src/test/setup.ts`](../src/test/setup.ts) - Test environment setup
- [`src/test/utils.tsx`](../src/test/utils.tsx) - Custom testing utilities
- [`src/components/__tests__/ThreeViewer.test.tsx`](../src/components/__tests__/ThreeViewer.test.tsx) - Complex component testing
- [`src/components/__tests__/ErrorBoundary.test.tsx`](../src/components/__tests__/ErrorBoundary.test.tsx) - Error boundary testing
- [`src/lib/__tests__/api.test.ts`](../src/lib/__tests__/api.test.ts) - API function testing

Remember: **Good tests give you confidence to refactor and add features**. Your ItemJS project already demonstrates excellent testing practices - use these patterns as you build new features!
