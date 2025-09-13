# 07 - Advanced React Patterns: Custom Hooks, HOCs, and Performance

## 📂 Your ItemJS Advanced Pattern Files
We'll analyze these actual advanced patterns from your project:
- **[src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx)** - Context API and custom hooks
- **[src/components/ThreeViewer.tsx](../src/components/ThreeViewer.tsx)** - Custom hooks and performance patterns
- **[src/pages/ShowItem.tsx](../src/pages/ShowItem.tsx)** - Modal management and state patterns
- **[src/components/UpdateItemModal.tsx](../src/components/UpdateItemModal.tsx)** - Form patterns and validation

## 🎯 Learning Goals
- Master custom hooks for reusable logic
- Learn higher-order components and render props
- Understand performance optimization techniques
- Practice error boundaries and suspense
- Compare advanced patterns with Laravel service patterns

## 🧩 Custom Hooks: Extracting Reusable Logic

### Laravel Service Pattern (Familiar):
```php
// Laravel service for reusable business logic
class ItemService 
{
    public function __construct(
        private ItemRepository $repository,
        private CacheManager $cache
    ) {}
    
    public function getItemsWithCache(int $page = 1, string $search = ''): Collection 
    {
        $cacheKey = "items.{$page}.{$search}";
        
        return $this->cache->remember($cacheKey, 300, function() use ($page, $search) {
            return $this->repository->paginate($page, $search);
        });
    }
    
    public function createItem(array $data): Item 
    {
        $item = $this->repository->create($data);
        $this->cache->forget('items.*');
        return $item;
    }
}
```

### React Custom Hook (New):
```typescript
// Custom hook for items management - similar to Laravel service
const useItems = (page: number = 1, search: string = '') => {
    const queryClient = useQueryClient()
    
    // Fetch items with caching (like Laravel cache)
    const { data, isLoading, error } = useQuery({
        queryKey: ['items', { page, search }],
        queryFn: () => itemsApi.getAll({ page, search }),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    })
    
    // Create item mutation (like Laravel service method)
    const createMutation = useMutation({
        mutationFn: itemsApi.create,
        onSuccess: () => {
            // Invalidate cache (like Laravel cache forget)
            queryClient.invalidateQueries({ queryKey: ['items'] })
        }
    })
    
    // Return interface (like Laravel service public methods)
    return {
        items: data?.items || [],
        pagination: data?.pagination,
        isLoading,
        error,
        createItem: createMutation.mutate,
        isCreating: createMutation.isPending
    }
}

// Usage in component (like injecting Laravel service)
const ItemsList = () => {
    const { items, isLoading, createItem } = useItems(1, '')
    
    if (isLoading) return <div>Loading...</div>
    
    return (
        <div>
            {items.map(item => (
                <div key={item.id}>{item.title}</div>
            ))}
        </div>
    )
}
```

## 🔍 Deep Dive: Your Custom Hook Patterns

### 1. **Authentication Hook Pattern**

**From your [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx):**
```typescript
// Custom hook for authentication (like Laravel Auth facade)
const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    
    // Check existing auth on mount (like Laravel middleware)
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token')
            if (token) {
                try {
                    const { user } = await authApi.me()
                    setUser(user)
                } catch (error) {
                    localStorage.removeItem('auth_token')
                }
            }
            setIsLoading(false)
        }
        
        checkAuth()
    }, [])
    
    const login = async (email: string, password: string) => {
        try {
            const { user, token } = await authApi.login(email, password)
            localStorage.setItem('auth_token', token)
            setUser(user)
            return user
        } catch (error) {
            throw error
        }
    }
    
    const logout = () => {
        localStorage.removeItem('auth_token')
        setUser(null)
    }
    
    return { user, login, logout, isLoading, isAuthenticated: !!user }
}
```

**Laravel Equivalent:**
```php
// Laravel Auth facade provides similar functionality
class AuthService 
{
    public function check(): bool 
    {
        return Auth::check();
    }
    
    public function user(): ?User 
    {
        return Auth::user();
    }
    
    public function login(string $email, string $password): bool 
    {
        return Auth::attempt(['email' => $email, 'password' => $password]);
    }
    
    public function logout(): void 
    {
        Auth::logout();
    }
}
```

### 2. **Modal Management Hook**

```typescript
// Custom hook for modal state management
const useModal = (initialOpen: boolean = false) => {
    const [isOpen, setIsOpen] = useState(initialOpen)
    
    const openModal = useCallback(() => setIsOpen(true), [])
    const closeModal = useCallback(() => setIsOpen(false), [])
    const toggleModal = useCallback(() => setIsOpen(prev => !prev), [])
    
    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                closeModal()
            }
        }
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, closeModal])
    
    return {
        isOpen,
        openModal,
        closeModal,
        toggleModal
    }
}

// Usage in your ShowItem component
const ShowItem = () => {
    const subItemModal = useModal()
    const updateModal = useModal()
    
    return (
        <div>
            <button onClick={subItemModal.openModal}>Add Sub Item</button>
            <button onClick={updateModal.openModal}>Update Item</button>
            
            {subItemModal.isOpen && (
                <AddSubItemModal onClose={subItemModal.closeModal} />
            )}
            
            {updateModal.isOpen && (
                <UpdateItemModal onClose={updateModal.closeModal} />
            )}
        </div>
    )
}
```

### 3. **Form Management Hook**

```typescript
// Custom hook for form state and validation
const useForm = <T extends Record<string, any>>(
    initialValues: T,
    validationRules?: Partial<Record<keyof T, (value: any) => string | undefined>>
) => {
    const [values, setValues] = useState<T>(initialValues)
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
    
    const setValue = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }))
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }, [errors])
    
    const setFieldTouched = useCallback((field: keyof T) => {
        setTouched(prev => ({ ...prev, [field]: true }))
    }, [])
    
    const validate = useCallback(() => {
        if (!validationRules) return true
        
        const newErrors: Partial<Record<keyof T, string>> = {}
        let isValid = true
        
        Object.keys(validationRules).forEach(field => {
            const rule = validationRules[field as keyof T]
            if (rule) {
                const error = rule(values[field as keyof T])
                if (error) {
                    newErrors[field as keyof T] = error
                    isValid = false
                }
            }
        })
        
        setErrors(newErrors)
        return isValid
    }, [values, validationRules])
    
    const reset = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
    }, [initialValues])
    
    return {
        values,
        errors,
        touched,
        setValue,
        setFieldTouched,
        validate,
        reset,
        isValid: Object.keys(errors).length === 0
    }
}

// Usage
const ItemForm = () => {
    const form = useForm(
        { title: '', content: '' },
        {
            title: (value) => !value ? 'Title is required' : undefined,
            content: (value) => value && value.length < 10 ? 'Content too short' : undefined
        }
    )
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (form.validate()) {
            // Submit form
            console.log('Form data:', form.values)
        }
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                value={form.values.title}
                onChange={(e) => form.setValue('title', e.target.value)}
                onBlur={() => form.setFieldTouched('title')}
            />
            {form.touched.title && form.errors.title && (
                <span className="error">{form.errors.title}</span>
            )}
        </form>
    )
}
```

## 🎭 Higher-Order Components (HOCs)

### 1. **Authentication HOC**

```typescript
// HOC for protecting routes (like Laravel middleware)
const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
        const { user, isLoading } = useAuth()
        
        if (isLoading) {
            return <div>Loading...</div>
        }
        
        if (!user) {
            return <Navigate to="/login" replace />
        }
        
        return <Component {...props} />
    }
}

// Usage
const ProtectedDashboard = withAuth(Dashboard)
const ProtectedItemForm = withAuth(AddItem)

// Laravel equivalent middleware
// Route::middleware('auth')->group(function () {
//     Route::get('/dashboard', [DashboardController::class, 'index']);
//     Route::get('/items/create', [ItemController::class, 'create']);
// });
```

### 2. **Loading State HOC**

```typescript
// HOC for handling loading states
const withLoading = <P extends object>(
    Component: React.ComponentType<P>
) => {
    return (props: P & { isLoading?: boolean; loadingText?: string }) => {
        const { isLoading, loadingText = 'Loading...', ...componentProps } = props
        
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">{loadingText}</span>
                </div>
            )
        }
        
        return <Component {...(componentProps as P)} />
    }
}

// Usage
const LoadingItemsList = withLoading(ItemsList)

<LoadingItemsList items={items} isLoading={isLoading} loadingText="Fetching items..." />
```

## 🚀 Performance Optimization Patterns

### 1. **Memoization Strategies**

**From your patterns:**
```typescript
// Memoize expensive calculations
const ItemsAnalytics = ({ items }: { items: Item[] }) => {
    // Only recalculate when items change
    const analytics = useMemo(() => {
        return {
            totalItems: items.length,
            totalViews: items.reduce((sum, item) => sum + item.viewCounts, 0),
            averageViews: items.length > 0 
                ? items.reduce((sum, item) => sum + item.viewCounts, 0) / items.length 
                : 0,
            topItems: items
                .sort((a, b) => b.viewCounts - a.viewCounts)
                .slice(0, 5)
        }
    }, [items])
    
    return (
        <div>
            <h3>Analytics</h3>
            <p>Total Items: {analytics.totalItems}</p>
            <p>Total Views: {analytics.totalViews}</p>
            <p>Average Views: {analytics.averageViews.toFixed(1)}</p>
        </div>
    )
}

// Memoize component to prevent unnecessary re-renders
const ItemCard = React.memo<{
    item: Item
    onSelect: (id: number) => void
}>(({ item, onSelect }) => {
    return (
        <div 
            className="border p-4 rounded cursor-pointer hover:bg-gray-50"
            onClick={() => onSelect(item.id)}
        >
            <h3>{item.title}</h3>
            <p>{item.viewCounts} views</p>
        </div>
    )
})

// Memoize callback to prevent child re-renders
const ItemsList = ({ items }: { items: Item[] }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null)
    
    // Stable callback reference
    const handleSelect = useCallback((id: number) => {
        setSelectedId(id)
    }, [])
    
    return (
        <div>
            {items.map(item => (
                <ItemCard 
                    key={item.id} 
                    item={item} 
                    onSelect={handleSelect}  // Stable reference
                />
            ))}
        </div>
    )
}
```

### 2. **Virtual Scrolling for Large Lists**

```typescript
// Custom hook for virtual scrolling
const useVirtualScrolling = <T>(
    items: T[],
    itemHeight: number,
    containerHeight: number
) => {
    const [scrollTop, setScrollTop] = useState(0)
    
    const visibleStart = Math.floor(scrollTop / itemHeight)
    const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    )
    
    const visibleItems = items.slice(visibleStart, visibleEnd)
    const totalHeight = items.length * itemHeight
    const offsetY = visibleStart * itemHeight
    
    return {
        visibleItems,
        totalHeight,
        offsetY,
        setScrollTop
    }
}

// Virtual scrolling component
const VirtualItemsList = ({ items }: { items: Item[] }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { visibleItems, totalHeight, offsetY, setScrollTop } = useVirtualScrolling(
        items,
        100, // item height
        400  // container height
    )
    
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
    }
    
    return (
        <div 
            ref={containerRef}
            className="h-96 overflow-auto"
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => (
                        <div key={visibleStart + index} className="h-25 border-b">
                            <ItemCard item={item} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
```

## 🛡️ Error Boundaries and Suspense

### 1. **Error Boundary Component**

```typescript
interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }
    
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
        // Send to error reporting service
    }
    
    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback
            return <FallbackComponent error={this.state.error!} />
        }
        
        return this.props.children
    }
}

const DefaultErrorFallback = ({ error }: { error: Error }) => (
    <div className="p-4 border border-red-300 rounded bg-red-50">
        <h2 className="text-red-800 font-semibold">Something went wrong</h2>
        <p className="text-red-600">{error.message}</p>
        <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
            Reload Page
        </button>
    </div>
)

// Usage
const App = () => (
    <ErrorBoundary>
        <Router>
            <Routes>
                <Route path="/items" element={<ItemsIndex />} />
                <Route path="/items/:slug" element={<ShowItem />} />
            </Routes>
        </Router>
    </ErrorBoundary>
)
```

### 2. **Suspense for Code Splitting**

```typescript
// Lazy load components
const ItemsIndex = lazy(() => import('./pages/ItemsIndex'))
const ShowItem = lazy(() => import('./pages/ShowItem'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Loading fallback
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
)

// App with suspense
const App = () => (
    <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
            <Router>
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/items" element={<ItemsIndex />} />
                    <Route path="/items/:slug" element={<ShowItem />} />
                </Routes>
            </Router>
        </Suspense>
    </ErrorBoundary>
)
```

## 🏃‍♂️ Practice Exercises

### Exercise 1: Create a Data Fetching Hook
Build a generic hook for API calls:

```typescript
interface UseApiOptions<T> {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    retry?: number
}

const useApi = <T>(
    apiCall: () => Promise<T>,
    dependencies: any[] = [],
    options: UseApiOptions<T> = {}
) => {
    // Your implementation here
    // Include: loading state, error handling, retry logic, caching
}

// Usage
const useItemDetails = (slug: string) => {
    return useApi(
        () => itemsApi.getBySlug(slug),
        [slug],
        {
            onSuccess: (data) => console.log('Item loaded:', data.item.title),
            onError: (error) => toast.error(error.message),
            retry: 3
        }
    )
}
```

### Exercise 2: Build a Notification System
Create a toast notification system with custom hooks:

```typescript
interface Notification {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
}

const useNotifications = () => {
    // Your implementation here
    // Include: add, remove, clear notifications
    // Auto-dismiss after duration
}

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    // Your implementation here
}

// Usage
const MyComponent = () => {
    const { addNotification } = useNotifications()
    
    const handleSuccess = () => {
        addNotification({
            type: 'success',
            message: 'Item created successfully!',
            duration: 3000
        })
    }
}
```

## 🎯 Key Takeaways

### Laravel vs React Advanced Patterns

| Pattern | Laravel | React |
|---------|---------|-------|
| **Reusable Logic** | Services/Traits | Custom Hooks |
| **Middleware** | Route Middleware | HOCs/Guards |
| **Caching** | Cache Facade | useMemo/React Query |
| **Error Handling** | Exception Handlers | Error Boundaries |
| **Lazy Loading** | Lazy Collections | React.lazy/Suspense |
| **Validation** | Form Requests | Custom Form Hooks |

### Advanced Pattern Benefits

1. **Custom Hooks** - Reusable stateful logic (like Laravel services)
2. **HOCs** - Cross-cutting concerns (like Laravel middleware)
3. **Memoization** - Performance optimization (like Laravel caching)
4. **Error Boundaries** - Graceful error handling (like Laravel exception handlers)
5. **Code Splitting** - Lazy loading (like Laravel lazy loading)

## 🚀 Next Steps

You now understand advanced React patterns! These patterns help you:
- **Extract reusable logic** with custom hooks
- **Optimize performance** with memoization
- **Handle errors gracefully** with boundaries
- **Manage complex state** with advanced patterns
- **Build scalable applications** with proper architecture

**Next Tutorial**: `09-practical-exercises.md` - Put all your knowledge into practice with hands-on coding challenges.

## 💡 Pro Tips for Laravel Developers

- **Think in hooks** - Extract logic like you would create Laravel services
- **Use HOCs sparingly** - Prefer hooks and composition over inheritance
- **Memoize wisely** - Don't over-optimize, profile first (like Laravel caching)
- **Handle errors early** - Use error boundaries like Laravel exception handlers
- **Split code logically** - Lazy load routes like Laravel route caching
- **Compose patterns** - Combine multiple patterns for complex scenarios
