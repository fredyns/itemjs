# 16 - React Best Practices: Code Quality & Maintainability

## 🎯 Learning Goals
- Master React best practices for production-ready applications
- Learn code organization, naming conventions, and project structure
- Understand performance optimization and security considerations
- Apply testing strategies and debugging techniques
- Compare with Laravel best practices and conventions

## 📚 Why Best Practices Matter

**Best practices** ensure your React code is maintainable, scalable, and performant. Just like Laravel has conventions (PSR standards, Eloquent patterns), React has established patterns that make your code predictable and professional.

### 🔄 **Laravel vs React Best Practices Comparison**

| Laravel Best Practice | React Equivalent | Purpose |
|----------------------|------------------|---------|
| PSR-4 Autoloading | ES6 Modules | Code organization |
| Eloquent Conventions | Component naming | Predictable patterns |
| Service Providers | Custom hooks | Logic abstraction |
| Form Requests | Validation schemas | Input validation |
| Blade Components | React components | Reusable UI |
| Middleware | Higher-order components | Cross-cutting concerns |

## 🏗️ **Project Structure & Organization**

### **1. Folder Structure Best Practices**
*Reference your ItemJS structure as a good example:*

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (Button, Input, etc.)
│   ├── forms/           # Form-specific components
│   └── layout/          # Layout components (Header, Sidebar)
├── pages/               # Route components
├── hooks/               # Custom hooks
├── lib/                 # Utilities and configurations
│   ├── api.ts          # API client
│   ├── utils.ts        # Helper functions
│   └── constants.ts    # App constants
├── types/               # TypeScript type definitions
├── stores/              # State management (Zustand/Redux)
└── assets/              # Static assets
```

**Laravel Equivalent:**
```php
app/
├── Http/Controllers/    # Route handlers
├── Models/             # Data models
├── Services/           # Business logic
├── Requests/           # Form validation
├── Resources/          # API transformers
└── Providers/          # Service providers

resources/views/
├── components/         # Blade components
├── layouts/           # Layout templates
└── pages/             # Page templates
```

### **2. Component Organization**
```typescript
// ✅ Good: Clear component structure
// src/components/ItemCard/index.ts
export { ItemCard } from './ItemCard'
export type { ItemCardProps } from './ItemCard'

// src/components/ItemCard/ItemCard.tsx
interface ItemCardProps {
  item: Item
  onEdit?: (item: Item) => void
  onDelete?: (itemId: number) => void
  className?: string
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  className = ''
}) => {
  // Component implementation
}

// src/components/ItemCard/ItemCard.test.tsx
// Component tests

// src/components/ItemCard/ItemCard.stories.tsx
// Storybook stories (if using)
```

## 📝 **Naming Conventions**

### **1. Component Naming**
```typescript
// ✅ Good: PascalCase for components
export const UserProfile = () => { ... }
export const ItemsList = () => { ... }
export const ThreeViewer = () => { ... } // Your actual component

// ❌ Bad: Other cases
export const userProfile = () => { ... }
export const user_profile = () => { ... }

// ✅ Good: Descriptive names
export const CreateItemModal = () => { ... }
export const ItemsSearchFilter = () => { ... }

// ❌ Bad: Generic names
export const Modal = () => { ... }
export const Filter = () => { ... }
```

### **2. Hook Naming**
```typescript
// ✅ Good: Always start with 'use'
export const useItemsQuery = () => { ... }
export const useAuth = () => { ... }
export const useLocalStorage = () => { ... }

// ✅ Good: Descriptive and specific
export const useItemFormValidation = () => { ... }
export const useThreeViewerControls = () => { ... }

// ❌ Bad: Not starting with 'use'
export const itemsQuery = () => { ... }
export const auth = () => { ... }
```

### **3. File Naming**
```typescript
// ✅ Good: Consistent naming
ItemCard.tsx           // Component files
ItemCard.test.tsx      // Test files
ItemCard.stories.tsx   // Storybook files
useItems.ts           // Hook files
api.ts                // Utility files
types.ts              // Type definition files

// ❌ Bad: Inconsistent naming
itemCard.tsx
Item-Card.tsx
item_card.tsx
```

## 🧩 **Component Best Practices**

### **1. Component Composition**
```typescript
// ✅ Good: Composable components (like your ItemJS structure)
<Card>
  <CardHeader>
    <CardTitle>Item Details</CardTitle>
    <CardDescription>View and edit item information</CardDescription>
  </CardHeader>
  <CardContent>
    <ItemForm item={item} />
  </CardContent>
  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>

// ❌ Bad: Monolithic components
<ItemDetailsCard 
  title="Item Details"
  description="View and edit item information"
  showForm={true}
  showButtons={true}
  item={item}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

### **2. Props Interface Design**
```typescript
// ✅ Good: Well-defined interfaces
interface ItemCardProps {
  item: Item                          // Required data
  variant?: 'default' | 'compact'     // Optional variants
  showActions?: boolean               // Optional behavior flags
  onEdit?: (item: Item) => void      // Optional callbacks
  onDelete?: (itemId: number) => void
  className?: string                  // Style customization
  'data-testid'?: string             // Testing support
}

// ✅ Good: Use discriminated unions for complex props
interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
}

interface CreateModalProps extends BaseModalProps {
  mode: 'create'
  onSubmit: (data: CreateItemData) => void
}

interface EditModalProps extends BaseModalProps {
  mode: 'edit'
  item: Item
  onSubmit: (data: UpdateItemData) => void
}

type ItemModalProps = CreateModalProps | EditModalProps

// Laravel equivalent
class ItemController extends Controller
{
    public function store(CreateItemRequest $request) { ... }
    public function update(UpdateItemRequest $request, Item $item) { ... }
}
```

### **3. Component Structure**
```typescript
// ✅ Good: Consistent component structure
export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  variant = 'default',
  showActions = true,
  onEdit,
  onDelete,
  className = '',
  'data-testid': testId
}) => {
  // 1. Hooks (always at the top)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // 2. Computed values
  const cardClasses = cn(
    'bg-white rounded-lg shadow-md p-6',
    variant === 'compact' && 'p-4',
    className
  )
  
  // 3. Event handlers
  const handleEdit = useCallback(() => {
    onEdit?.(item)
  }, [onEdit, item])
  
  const handleDelete = useCallback(async () => {
    setIsLoading(true)
    try {
      await onDelete?.(item.id)
      toast({ title: 'Item deleted successfully' })
    } catch (error) {
      toast({ title: 'Failed to delete item', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [onDelete, item.id, toast])
  
  // 4. Early returns
  if (!item) return null
  
  // 5. Main render
  return (
    <div className={cardClasses} data-testid={testId}>
      {/* Component JSX */}
    </div>
  )
}
```

## 🎣 **Custom Hooks Best Practices**

### **1. Single Responsibility**
```typescript
// ✅ Good: Focused, single-purpose hooks
export const useItemsQuery = (filters: ItemFilters) => {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: () => itemsApi.getAll(filters),
  })
}

export const useItemMutations = () => {
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: itemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateItemData }) =>
      itemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
  
  return { createMutation, updateMutation }
}

// ❌ Bad: Doing too much in one hook
export const useItems = () => {
  // Fetching, mutations, local state, validation, etc. all in one hook
}
```

### **2. Consistent Return Patterns**
```typescript
// ✅ Good: Consistent object returns
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: handleLogin,
    logout: handleLogout,
  }
}

// ✅ Good: Array returns for simple cases
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)
  
  const toggle = useCallback(() => setValue(prev => !prev), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  
  return [value, { toggle, setTrue, setFalse }] as const
}
```

## 🚀 **Performance Best Practices**

### **1. Memoization Strategies**
```typescript
// ✅ Good: Memoize expensive calculations
export const ItemsList: React.FC<ItemsListProps> = ({ items, filters }) => {
  // Memoize expensive filtering/sorting
  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.title.includes(filters.search))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [items, filters.search])
  
  // Memoize callbacks passed to children
  const handleItemClick = useCallback((item: Item) => {
    navigate(`/items/${item.slug}`)
  }, [navigate])
  
  return (
    <div className="grid gap-4">
      {filteredItems.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  )
}

// ✅ Good: Memoize components that receive stable props
export const ItemCard = React.memo<ItemCardProps>(({ item, onClick }) => {
  return (
    <div onClick={() => onClick(item)}>
      {item.title}
    </div>
  )
})

// ❌ Bad: Over-memoizing simple components
export const SimpleButton = React.memo(({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
))
```

### **2. Code Splitting**
```typescript
// ✅ Good: Lazy load heavy components
const ThreeViewer = lazy(() => import('../components/ThreeViewer'))
const ItemsIndex = lazy(() => import('../pages/ItemsIndex'))

// ✅ Good: Route-based code splitting
const router = createBrowserRouter([
  {
    path: '/items',
    element: (
      <Suspense fallback={<ItemsListSkeleton />}>
        <ItemsIndex />
      </Suspense>
    ),
  },
  {
    path: '/items/:slug',
    element: (
      <Suspense fallback={<ItemDetailsSkeleton />}>
        <ShowItem />
      </Suspense>
    ),
  },
])

// Laravel equivalent
Route::get('/items', [ItemController::class, 'index']);
Route::get('/items/{item:slug}', [ItemController::class, 'show']);
```

## 🔒 **Security Best Practices**

### **1. Input Sanitization**
```typescript
// ✅ Good: Validate and sanitize inputs
import { z } from 'zod'
import DOMPurify from 'dompurify'

const itemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
})

export const ItemForm = () => {
  const form = useForm({
    resolver: zodResolver(itemSchema),
  })
  
  const handleSubmit = (data: ItemFormData) => {
    // Sanitize HTML content
    const sanitizedData = {
      ...data,
      description: data.description 
        ? DOMPurify.sanitize(data.description)
        : undefined,
    }
    
    onSubmit(sanitizedData)
  }
}

// Laravel equivalent
class CreateItemRequest extends FormRequest
{
    public function rules()
    {
        return [
            'title' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
        ];
    }
    
    public function prepareForValidation()
    {
        $this->merge([
            'description' => $this->description 
                ? strip_tags($this->description)
                : null,
        ]);
    }
}
```

### **2. Environment Variables**
```typescript
// ✅ Good: Proper environment variable handling
// .env.local
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ItemJS

// src/lib/config.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  appName: import.meta.env.VITE_APP_NAME || 'ItemJS',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const

// ❌ Bad: Hardcoded values
const API_URL = 'http://localhost:3000/api' // Don't do this

// Laravel equivalent
// .env
APP_NAME=ItemJS
APP_URL=http://localhost

// config/app.php
'name' => env('APP_NAME', 'Laravel'),
'url' => env('APP_URL', 'http://localhost'),
```

## 🧪 **Testing Best Practices**

### **1. Component Testing**
```typescript
// ✅ Good: Comprehensive component tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ItemCard } from './ItemCard'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const renderWithProviders = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('ItemCard', () => {
  const mockItem = {
    id: 1,
    title: 'Test Item',
    description: 'Test description',
    price: 99.99,
  }
  
  it('renders item information correctly', () => {
    renderWithProviders(<ItemCard item={mockItem} />)
    
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })
  
  it('calls onEdit when edit button is clicked', async () => {
    const mockOnEdit = jest.fn()
    
    renderWithProviders(
      <ItemCard item={mockItem} onEdit={mockOnEdit} showActions />
    )
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockItem)
    })
  })
})

// Laravel equivalent
class ItemTest extends TestCase
{
    public function test_item_displays_correctly()
    {
        $item = Item::factory()->create([
            'title' => 'Test Item',
            'description' => 'Test description',
            'price' => 99.99,
        ]);
        
        $response = $this->get("/items/{$item->slug}");
        
        $response->assertSee('Test Item');
        $response->assertSee('Test description');
        $response->assertSee('$99.99');
    }
}
```

### **2. Hook Testing**
```typescript
// ✅ Good: Custom hook testing
import { renderHook, act } from '@testing-library/react'
import { useItemsQuery } from './useItemsQuery'

jest.mock('../lib/api', () => ({
  itemsApi: {
    getAll: jest.fn(),
  },
}))

describe('useItemsQuery', () => {
  it('fetches items successfully', async () => {
    const mockItems = [{ id: 1, title: 'Test Item' }]
    ;(itemsApi.getAll as jest.Mock).mockResolvedValue({ items: mockItems })
    
    const { result } = renderHook(() => useItemsQuery({ page: 1 }))
    
    await waitFor(() => {
      expect(result.current.data?.items).toEqual(mockItems)
      expect(result.current.isLoading).toBe(false)
    })
  })
})
```

## 🐛 **Error Handling Best Practices**

### **1. Error Boundaries**
```typescript
// ✅ Good: Comprehensive error boundary
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<ErrorInfo> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo })
    }
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} />
    }
    
    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={ItemsErrorFallback}>
  <ItemsList />
</ErrorBoundary>
```

### **2. API Error Handling**
```typescript
// ✅ Good: Consistent error handling
export const useItemMutations = () => {
  const { toast } = useToast()
  
  const createMutation = useMutation({
    mutationFn: itemsApi.create,
    onSuccess: (data) => {
      toast({
        title: 'Success!',
        description: 'Item created successfully.',
      })
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to create item'
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      
      // Log for debugging
      console.error('Create item error:', error)
    },
  })
  
  return { createMutation }
}

// Laravel equivalent
class ItemController extends Controller
{
    public function store(CreateItemRequest $request)
    {
        try {
            $item = Item::create($request->validated());
            
            return response()->json([
                'item' => $item,
                'message' => 'Item created successfully'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to create item', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);
            
            return response()->json([
                'message' => 'Failed to create item'
            ], 500);
        }
    }
}
```

## 📱 **Accessibility Best Practices**

### **1. Semantic HTML and ARIA**
```typescript
// ✅ Good: Proper accessibility attributes
export const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  return (
    <article 
      className="item-card"
      role="article"
      aria-labelledby={`item-title-${item.id}`}
    >
      <h3 id={`item-title-${item.id}`} className="item-title">
        {item.title}
      </h3>
      
      <p className="item-description" aria-describedby={`item-desc-${item.id}`}>
        {item.description}
      </p>
      
      <div className="item-actions" role="group" aria-label="Item actions">
        <button
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.title}`}
          className="btn-edit"
        >
          <EditIcon aria-hidden="true" />
          Edit
        </button>
        
        <button
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.title}`}
          className="btn-delete"
        >
          <DeleteIcon aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  )
}
```

### **2. Keyboard Navigation**
```typescript
// ✅ Good: Keyboard accessibility
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isOpen) return
    
    // Focus trap
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements?.[0] as HTMLElement
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()
    
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div 
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef} className="modal-content">
        {children}
      </div>
    </div>
  )
}
```

## 📊 **Code Quality Tools**

### **1. ESLint Configuration**
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### **2. Prettier Configuration**
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### **3. TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🎯 **Key Takeaways**

### **React vs Laravel Best Practices:**

1. **Code Organization**: Component-based vs MVC structure
2. **Naming Conventions**: PascalCase components vs snake_case methods
3. **Type Safety**: TypeScript interfaces vs PHP type hints
4. **Testing**: Component testing vs Feature/Unit tests
5. **Error Handling**: Error boundaries vs Exception handling

### **Essential Practices:**
- ✅ **Consistent naming** and file organization
- ✅ **Component composition** over large monolithic components
- ✅ **Custom hooks** for reusable logic
- ✅ **Proper memoization** for performance
- ✅ **Comprehensive testing** strategy
- ✅ **Accessibility** considerations
- ✅ **Error boundaries** for graceful failures

### **Common Pitfalls to Avoid:**
- ❌ **Over-memoization** of simple components
- ❌ **Prop drilling** instead of proper state management
- ❌ **Inline object/function** creation in render
- ❌ **Missing dependency arrays** in useEffect
- ❌ **Mutating state directly** instead of using setState
- ❌ **Not handling loading/error states** properly

## 🚀 **Implementation Checklist**

### **Before Writing Code:**
- [ ] Plan component structure and data flow
- [ ] Define TypeScript interfaces first
- [ ] Consider accessibility requirements
- [ ] Plan testing strategy

### **During Development:**
- [ ] Follow naming conventions consistently
- [ ] Write tests alongside components
- [ ] Handle loading and error states
- [ ] Optimize performance with memoization
- [ ] Add proper TypeScript types

### **Before Deployment:**
- [ ] Run linting and type checking
- [ ] Ensure all tests pass
- [ ] Check accessibility with screen readers
- [ ] Review performance with React DevTools
- [ ] Validate error handling scenarios

## 💡 **Next Steps**

After mastering these best practices:
1. **Set up automated tooling** - ESLint, Prettier, Husky
2. **Implement CI/CD pipeline** - Automated testing and deployment
3. **Add performance monitoring** - Bundle analysis and runtime metrics
4. **Create style guides** - Document your team's conventions
5. **Regular code reviews** - Maintain quality standards

Remember: **Best practices are guidelines, not rules**. Adapt them to your project's specific needs while maintaining consistency and code quality.

Your ItemJS project already demonstrates many of these practices - use it as a reference for implementing these patterns in future projects!
