# 04 - State Management: Mastering React State and Data Flow

## 📂 Your ItemJS State Management Files
We'll analyze these actual components from your project:
- **[ItemsIndex.tsx](../src/pages/ItemsIndex.tsx)** - Complex list with pagination, search, and filtering (lines 1-271)
- **[ShowItem.tsx](../src/pages/ShowItem.tsx)** - Item details with modal state management (lines 1-294)
- **[Dashboard.tsx](../src/pages/Dashboard.tsx)** - Statistics with derived state (lines 1-187)
- **[src/lib/api/items.ts](../src/lib/api/items.ts)** - API layer with React Query integration

## 🎯 Learning Goals
- Master different types of state in React applications
- Learn React Query for server state management
- Understand controlled vs uncontrolled components
- Practice pagination, search, and filtering patterns
- Compare React state management with Laravel session/request handling

## 🏗️ State Management Fundamentals

### Laravel State Management (Familiar):
```php
// Laravel handles state through sessions, requests, and databases
class ItemController extends Controller 
{
    public function index(Request $request) 
    {
        // Request state (URL parameters, form data)
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        $perPage = $request->get('per_page', 12);
        
        // Database state (persistent data)
        $items = Item::where('title', 'like', "%{$search}%")
                    ->paginate($perPage, ['*'], 'page', $page);
        
        // Session state (user-specific data)
        $favorites = session('favorite_items', []);
        
        // View state (temporary display data)
        return view('items.index', compact('items', 'search', 'favorites'));
    }
}
```

### React State Management (New):
```typescript
// React manages state through hooks and external libraries
const ItemsIndex = () => {
    // Local UI state (like Laravel request parameters)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    
    // Server state (like Laravel database queries)
    const { data, isLoading, error } = useQuery({
        queryKey: ['items', { page, limit: 12, search }],
        queryFn: () => itemsApi.getAll({ page, limit: 12, search }),
    })
    
    // Derived state (computed from other state)
    const totalPages = Math.ceil((data?.total || 0) / 12)
    const hasNextPage = page < totalPages
    
    return (
        <div>
            {/* Component JSX */}
        </div>
    )
}
```

## 🔍 Deep Dive: Your ItemsIndex State Management

Let's analyze your actual **[ItemsIndex.tsx](../src/pages/ItemsIndex.tsx)** component:

### 1. **Local State Management**

**From your [ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 15-19):**
```typescript
// Pagination state
const [page, setPage] = useState(1)

// Search state - separate input and applied search
const [search, setSearch] = useState('')
const [searchInput, setSearchInput] = useState('')

// Configuration
const limit = 12
```

**Laravel Equivalent:**
```php
// Laravel would handle this through request parameters
$page = $request->get('page', 1);
$search = $request->get('search', '');
$limit = 12;

// Laravel doesn't need separate input state - forms handle this
```

**State Categories:**
- **UI State**: Controls what the user sees (`page`, `searchInput`)
- **Application State**: Business logic state (`search`)
- **Configuration**: Constants that rarely change (`limit`)

### 2. **Server State with React Query**

**From your [ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 21-25):**
```typescript
// React Query manages server state automatically
const { data, isLoading, error } = useQuery({
    queryKey: ['items', { page, limit, search }],
    queryFn: () => itemsApi.getAll({ page, limit, search }),
})
```

**Laravel Equivalent:**
```php
// Laravel handles this in the controller method
try {
    $items = Item::where('title', 'like', "%{$search}%")
                ->paginate($limit, ['*'], 'page', $page);
    
    return view('items.index', [
        'items' => $items,
        'isLoading' => false,
        'error' => null
    ]);
} catch (Exception $e) {
    return view('items.index', [
        'items' => null,
        'isLoading' => false,
        'error' => $e->getMessage()
    ]);
}
```

**React Query Benefits:**
- **Automatic caching**: Prevents unnecessary API calls
- **Background refetching**: Keeps data fresh
- **Loading states**: Built-in loading and error handling
- **Optimistic updates**: UI updates before server confirms

### 3. **Derived State Patterns**

**From your [ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 27-29):**
```typescript
// Computed values based on server data
const totalPages = Math.ceil((data?.total || 0) / limit)
const hasNextPage = page < totalPages
const hasPreviousPage = page > 1
```

**Laravel Equivalent:**
```php
// Laravel Paginator provides these automatically
$totalPages = $items->lastPage();
$hasNextPage = $items->hasMorePages();
$hasPreviousPage = $items->currentPage() > 1;
```

**Derived State Best Practices:**
- **Don't store computed values in state** - calculate them during render
- **Use useMemo for expensive calculations**
- **Keep derived state close to where it's used**

### 4. **Event Handlers and State Updates**

**From your [ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 31-50):**
```typescript
// Search handler with debouncing concept
const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput) // Apply the search
    setPage(1) // Reset to first page
}

// Pagination handlers
const handleNextPage = () => {
    if (hasNextPage) {
        setPage(prev => prev + 1)
    }
}

const handlePreviousPage = () => {
    if (hasPreviousPage) {
        setPage(prev => prev - 1)
    }
}

// Clear search
const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
}
```

**Laravel Equivalent:**
```php
// Laravel handles this through form submissions and redirects
public function search(Request $request) 
{
    $search = $request->get('search', '');
    
    return redirect()->route('items.index', [
        'search' => $search,
        'page' => 1 // Reset to first page
    ]);
}

public function clearSearch() 
{
    return redirect()->route('items.index');
}
```

**Event Handler Patterns:**
- **Prevent default**: Stop form submission from reloading page
- **State batching**: Multiple setState calls are batched together
- **Functional updates**: Use `prev => prev + 1` for state based on previous value
- **Side effects**: Reset related state when one state changes

### 5. **Controlled Components Pattern**

**From your [ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 80-95):**
```typescript
{/* Search form - controlled input */}
<form onSubmit={handleSearch} className="mb-6">
    <div className="flex gap-2">
        <input
            type="text"
            placeholder="Search items..."
            value={searchInput}  // Controlled by React state
            onChange={(e) => setSearchInput(e.target.value)}  // Updates state
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
            Search
        </button>
        {search && (
            <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
                Clear
            </button>
        )}
    </div>
</form>
```

**Laravel Equivalent (Blade):**
```blade
{{-- Laravel form - server handles state --}}
<form method="GET" action="{{ route('items.index') }}">
    <div class="flex gap-2">
        <input 
            type="text" 
            name="search" 
            placeholder="Search items..."
            value="{{ request('search') }}"  {{-- Server provides value --}}
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">
            Search
        </button>
        @if(request('search'))
            <a href="{{ route('items.index') }}" class="px-4 py-2 bg-gray-500 text-white rounded-md">
                Clear
            </a>
        @endif
    </div>
</form>
```

**Controlled vs Uncontrolled:**
- **Controlled**: React state controls the input value
- **Uncontrolled**: DOM controls the input value (use `ref` to access)
- **Best practice**: Use controlled components for form validation and dynamic behavior

## 🔄 Advanced State Patterns

### 1. **Modal State Management**

**From your [ShowItem.tsx](../src/pages/ShowItem.tsx) (lines 25-35):**
```typescript
// Modal state for sub-items
const [isSubItemModalOpen, setIsSubItemModalOpen] = useState(false)
const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

// Modal handlers
const openSubItemModal = () => setIsSubItemModalOpen(true)
const closeSubItemModal = () => setIsSubItemModalOpen(false)

const openUpdateModal = () => setIsUpdateModalOpen(true)
const closeUpdateModal = () => setIsUpdateModalOpen(false)
```

**Laravel Equivalent:**
```php
// Laravel would use session flash messages or URL parameters
public function showWithModal(Item $item, $modal = null) 
{
    return view('items.show', [
        'item' => $item,
        'showSubItemModal' => $modal === 'sub-item',
        'showUpdateModal' => $modal === 'update'
    ]);
}
```

### 2. **Optimistic Updates with Mutations**

**From your [ShowItem.tsx](../src/pages/ShowItem.tsx) (lines 45-55):**
```typescript
// Delete mutation with optimistic UI updates
const deleteItemMutation = useMutation({
    mutationFn: itemsApi.delete,
    onSuccess: async () => {
        // Invalidate and refetch items list
        await queryClient.invalidateQueries({ queryKey: ['items'] })
        // Navigate away after successful delete
        await navigate({ to: '/items' })
    },
    onError: (error) => {
        // Handle error (show toast, etc.)
        console.error('Failed to delete item:', error)
    }
})
```

**Laravel Equivalent:**
```php
public function destroy(Item $item) 
{
    try {
        $item->delete();
        
        return redirect()
            ->route('items.index')
            ->with('success', 'Item deleted successfully');
    } catch (Exception $e) {
        return redirect()
            ->back()
            ->with('error', 'Failed to delete item: ' . $e->getMessage());
    }
}
```

### 3. **Complex State with useReducer**

```typescript
// For complex state logic, use useReducer instead of multiple useState
interface ItemsState {
    items: Item[]
    loading: boolean
    error: string | null
    page: number
    search: string
    filters: {
        category: string
        status: string
    }
}

type ItemsAction = 
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: Item[] }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'SET_FILTER'; payload: { key: string; value: string } }
    | { type: 'RESET_FILTERS' }

const itemsReducer = (state: ItemsState, action: ItemsAction): ItemsState => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null }
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, items: action.payload }
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload }
        case 'SET_PAGE':
            return { ...state, page: action.payload }
        case 'SET_SEARCH':
            return { ...state, search: action.payload, page: 1 }
        case 'SET_FILTER':
            return {
                ...state,
                filters: { ...state.filters, [action.payload.key]: action.payload.value },
                page: 1
            }
        case 'RESET_FILTERS':
            return {
                ...state,
                filters: { category: '', status: '' },
                search: '',
                page: 1
            }
        default:
            return state
    }
}

// Usage in component
const ItemsWithReducer = () => {
    const [state, dispatch] = useReducer(itemsReducer, {
        items: [],
        loading: false,
        error: null,
        page: 1,
        search: '',
        filters: { category: '', status: '' }
    })
    
    const handleSearch = (searchTerm: string) => {
        dispatch({ type: 'SET_SEARCH', payload: searchTerm })
    }
    
    const handleFilterChange = (key: string, value: string) => {
        dispatch({ type: 'SET_FILTER', payload: { key, value } })
    }
    
    return (
        <div>
            {/* Component JSX */}
        </div>
    )
}
```

## 🌐 Global State Management

### 1. **Context API for App-wide State**

```typescript
// Create context for user authentication
interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    
    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const userData = await authApi.login(email, password)
            setUser(userData)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }
    
    const logout = () => {
        setUser(null)
        // Clear tokens, redirect, etc.
    }
    
    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Usage in components
const Navigation = () => {
    const { user, logout } = useAuth()
    
    return (
        <nav>
            {user ? (
                <button onClick={logout}>Logout {user.name}</button>
            ) : (
                <Link to="/login">Login</Link>
            )}
        </nav>
    )
}
```

### 2. **Zustand for Simple Global State**

```typescript
// Install: npm install zustand
import { create } from 'zustand'

interface AppState {
    theme: 'light' | 'dark'
    sidebarOpen: boolean
    notifications: Notification[]
    setTheme: (theme: 'light' | 'dark') => void
    toggleSidebar: () => void
    addNotification: (notification: Notification) => void
    removeNotification: (id: string) => void
}

const useAppStore = create<AppState>((set) => ({
    theme: 'light',
    sidebarOpen: false,
    notifications: [],
    
    setTheme: (theme) => set({ theme }),
    
    toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
    })),
    
    addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, notification]
    })),
    
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
    }))
}))

// Usage in components
const ThemeToggle = () => {
    const { theme, setTheme } = useAppStore()
    
    return (
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    )
}
```

## 📊 Performance Optimization

### 1. **Memoization with React.memo and useMemo**

**From your patterns:**
```typescript
// Memoize expensive calculations
const ItemsIndex = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['items', { page, search }],
        queryFn: () => itemsApi.getAll({ page, search }),
    })
    
    // Expensive calculation - only recalculate when data changes
    const itemStats = useMemo(() => {
        if (!data?.items) return null
        
        return {
            totalItems: data.total,
            averageRating: data.items.reduce((acc, item) => acc + item.rating, 0) / data.items.length,
            categories: [...new Set(data.items.map(item => item.category))]
        }
    }, [data?.items])
    
    return (
        <div>
            {itemStats && (
                <div>
                    <p>Total: {itemStats.totalItems}</p>
                    <p>Average Rating: {itemStats.averageRating.toFixed(1)}</p>
                </div>
            )}
        </div>
    )
}

// Memoize component to prevent unnecessary re-renders
const ItemCard = React.memo<{ item: Item; onSelect: (id: string) => void }>(({ item, onSelect }) => {
    return (
        <div className="border p-4 rounded" onClick={() => onSelect(item.id)}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
        </div>
    )
})
```

### 2. **Callback Optimization with useCallback**

```typescript
const ItemsList = () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    
    // Memoize callback to prevent child re-renders
    const handleItemSelect = useCallback((itemId: string) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
    }, [])
    
    return (
        <div>
            {items.map(item => (
                <ItemCard 
                    key={item.id} 
                    item={item} 
                    onSelect={handleItemSelect}  // Stable reference
                />
            ))}
        </div>
    )
}
```

## 🏃‍♂️ Practice Exercises

### Exercise 1: Build a Filtered Product List
Create a component similar to your ItemsIndex with additional filters:

```typescript
interface Product {
    id: string
    name: string
    category: string
    price: number
    inStock: boolean
}

const ProductList = () => {
    // State for pagination, search, and filters
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
    const [showInStockOnly, setShowInStockOnly] = useState(false)
    
    // Your implementation here:
    // - Use React Query for data fetching
    // - Implement search, category filter, price range, and stock filter
    // - Add pagination
    // - Handle loading and error states
}
```

### Exercise 2: Shopping Cart with Context
Create a shopping cart using Context API:

```typescript
interface CartItem {
    productId: string
    quantity: number
    price: number
}

interface CartContextType {
    items: CartItem[]
    addItem: (productId: string, price: number) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    total: number
}

// Implement CartProvider and useCart hook
// Use in multiple components across your app
```

## 🎯 Key Takeaways

### Laravel vs React State Management

| Aspect | Laravel | React |
|--------|---------|-------|
| **Request State** | `$request->get()` | `useState()` |
| **Session State** | `session()` | Context API / Zustand |
| **Database State** | Eloquent queries | React Query |
| **Form State** | Form requests | Controlled components |
| **Validation** | Form Request classes | Form libraries (react-hook-form) |
| **Flash Messages** | `session()->flash()` | Toast notifications |

### React State Best Practices

1. **Keep state close to where it's used** - Don't lift state up unnecessarily
2. **Use the right state type**:
   - `useState` for simple local state
   - `useReducer` for complex state logic
   - React Query for server state
   - Context for global app state
3. **Optimize performance** with `useMemo`, `useCallback`, and `React.memo`
4. **Handle all states**: loading, success, error, empty
5. **Use controlled components** for forms and inputs

## 🚀 Next Steps

You now understand React state management patterns! Your ItemsIndex component demonstrates excellent state management with:
- **Local UI state** for pagination and search
- **Server state** with React Query
- **Derived state** for computed values
- **Event handlers** for state updates

**Next Tutorial**: `05-api-integration.md` - Learn how to integrate with APIs, handle authentication, and manage data flow.

## 💡 Pro Tips for Laravel Developers

- **Think in components**: Each component manages its own state (like Laravel controllers)
- **Separate concerns**: UI state vs server state vs global state
- **Use React Query**: It's like having Eloquent relationships that auto-update
- **Embrace immutability**: Always create new objects/arrays instead of mutating
- **Lift state up**: When multiple components need the same data
- **Keep it simple**: Start with `useState`, upgrade to `useReducer` when needed
