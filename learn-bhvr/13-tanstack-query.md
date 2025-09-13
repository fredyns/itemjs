# 13 - TanStack Query: Modern Data Fetching for React

## 🎯 Learning Goals
- Master TanStack Query (formerly React Query) for server state management
- Understand caching, synchronization, and background updates
- Learn mutations, optimistic updates, and error handling
- Apply patterns from your ItemJS project's actual implementation
- Compare with Laravel's Eloquent and HTTP client patterns

## 📚 What is TanStack Query?

**TanStack Query** is a powerful data-fetching library that manages server state in React applications. Think of it as **Laravel's Eloquent + HTTP Client + Cache** all rolled into one for the frontend.

### 🔄 **Laravel vs TanStack Query Comparison**

| Laravel Concept | TanStack Query Equivalent | Purpose |
|----------------|---------------------------|---------|
| `Model::find()` | `useQuery()` | Fetch single record |
| `Model::all()` | `useQuery()` with list | Fetch multiple records |
| `Model::create()` | `useMutation()` | Create new record |
| `Model::update()` | `useMutation()` | Update existing record |
| `Model::delete()` | `useMutation()` | Delete record |
| Cache tags | Query keys | Cache invalidation |
| Eager loading | `useQueries()` | Batch requests |
| Model events | Query callbacks | Lifecycle hooks |

## 🏗️ Your ItemJS Implementation

Let's examine how your project uses TanStack Query effectively.

### **Query Client Setup**
*Reference: [src/main.tsx](../src/main.tsx) lines 8-15*

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Laravel Equivalent:**
```php
// config/cache.php - Similar cache configuration
'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
],

// Cache usage in Laravel
Cache::remember('items', 300, function () {
    return Item::with('subItems')->get();
});
```

## 🔍 **Data Fetching Patterns**

### **1. Basic Query Usage**
*Reference: [src/pages/ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) lines 20-25*

```typescript
// Your ItemsIndex implementation
const { data, isLoading, error } = useQuery({
  queryKey: ['items', { page, limit, search }],
  queryFn: () => itemsApi.getAll({ page, limit, search }),
})

// Laravel equivalent
class ItemController extends Controller 
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $limit = $request->get('limit', 12);
        $search = $request->get('search', '');
        
        return Item::when($search, function ($query, $search) {
            return $query->where('title', 'like', "%{$search}%");
        })->paginate($limit);
    }
}
```

### **Key Concepts:**

#### **Query Keys** (Like Laravel Cache Keys)
```typescript
// Static key
queryKey: ['items']

// Dynamic key with parameters
queryKey: ['items', { page, limit, search }]

// Nested resource key
queryKey: ['items', itemId, 'subItems']

// Laravel cache equivalent
Cache::tags(['items'])->remember("items.{$page}.{$limit}.{$search}", 300, $callback);
```

#### **Query Functions** (Like Laravel Repository Methods)
```typescript
// Your API client pattern
const itemsApi = {
  getAll: ({ page, limit, search }) => 
    fetch(`/api/items?page=${page}&limit=${limit}&search=${search}`)
      .then(res => res.json()),
      
  getBySlug: (slug) =>
    fetch(`/api/items/${slug}`)
      .then(res => res.json()),
}

// Laravel repository pattern
class ItemRepository 
{
    public function getAll($page, $limit, $search)
    {
        return Item::when($search, function ($query, $search) {
            return $query->where('title', 'like', "%{$search}%");
        })->paginate($limit);
    }
    
    public function getBySlug($slug)
    {
        return Item::where('slug', $slug)->firstOrFail();
    }
}
```

### **2. Single Item Query**
*Reference: [src/pages/ShowItem.tsx](../src/pages/ShowItem.tsx) lines 15-18*

```typescript
// Your ShowItem implementation
const { data: item, isLoading, error } = useQuery({
  queryKey: ['item', slug],
  queryFn: () => itemsApi.getBySlug(slug),
  enabled: !!slug, // Only run query if slug exists
})

// Laravel equivalent
Route::get('/items/{item:slug}', function (Item $item) {
    return $item->load('subItems', 'user');
});
```

### **3. Dependent Queries**
```typescript
// Fetch item first, then its related data
const { data: item } = useQuery({
  queryKey: ['item', itemId],
  queryFn: () => itemsApi.getById(itemId),
})

const { data: subItems } = useQuery({
  queryKey: ['item', itemId, 'subItems'],
  queryFn: () => subItemsApi.getByItemId(itemId),
  enabled: !!item, // Wait for item to load first
})

// Laravel equivalent with eager loading
$item = Item::with('subItems')->find($itemId);
```

## ✏️ **Mutations (Create, Update, Delete)**

### **1. Create Mutation**
*Reference: [src/pages/ShowItem.tsx](../src/pages/ShowItem.tsx) lines 45-55*

```typescript
// Your create sub-item mutation
const createSubItemMutation = useMutation({
  mutationFn: subItemsApi.create,
  onSuccess: (newSubItem) => {
    // Invalidate and refetch related queries
    queryClient.invalidateQueries({ queryKey: ['item', slug] })
    queryClient.invalidateQueries({ queryKey: ['items'] })
    
    // Show success message
    toast.success('Sub-item created successfully!')
  },
  onError: (error) => {
    toast.error('Failed to create sub-item')
    console.error('Create error:', error)
  },
})

// Usage
const handleCreateSubItem = (formData) => {
  createSubItemMutation.mutate({
    ...formData,
    itemId: item.id,
  })
}

// Laravel equivalent
class SubItemController extends Controller
{
    public function store(Request $request, Item $item)
    {
        $subItem = $item->subItems()->create($request->validated());
        
        // Clear cache
        Cache::tags(['items', 'subItems'])->flush();
        
        return response()->json([
            'subItem' => $subItem,
            'message' => 'Sub-item created successfully!'
        ]);
    }
}
```

### **2. Update Mutation**
```typescript
// Update item mutation
const updateItemMutation = useMutation({
  mutationFn: ({ id, data }) => itemsApi.update(id, data),
  onSuccess: (updatedItem) => {
    // Update the cache directly (optimistic update)
    queryClient.setQueryData(['item', updatedItem.slug], updatedItem)
    
    // Invalidate list to ensure consistency
    queryClient.invalidateQueries({ queryKey: ['items'] })
  },
})

// Laravel equivalent
public function update(Request $request, Item $item)
{
    $item->update($request->validated());
    
    Cache::forget("item.{$item->slug}");
    Cache::tags(['items'])->flush();
    
    return $item->fresh();
}
```

### **3. Delete Mutation**
*Reference: [src/pages/ShowItem.tsx](../src/pages/ShowItem.tsx) lines 35-43*

```typescript
// Your delete item mutation
const deleteItemMutation = useMutation({
  mutationFn: itemsApi.delete,
  onSuccess: async () => {
    // Invalidate queries and navigate away
    await queryClient.invalidateQueries({ queryKey: ['items'] })
    await navigate({ to: '/items' })
    toast.success('Item deleted successfully!')
  },
  onError: (error) => {
    toast.error('Failed to delete item')
  },
})

// Laravel equivalent
public function destroy(Item $item)
{
    $item->delete();
    
    Cache::tags(['items'])->flush();
    Cache::forget("item.{$item->slug}");
    
    return response()->json(['message' => 'Item deleted successfully']);
}
```

## 🔄 **Advanced Patterns**

### **1. Optimistic Updates**
```typescript
// Optimistic update for quick UI feedback
const updateItemMutation = useMutation({
  mutationFn: itemsApi.update,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['item', newData.id] })
    
    // Snapshot previous value
    const previousItem = queryClient.getQueryData(['item', newData.id])
    
    // Optimistically update cache
    queryClient.setQueryData(['item', newData.id], old => ({
      ...old,
      ...newData
    }))
    
    return { previousItem }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['item', newData.id], context.previousItem)
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['item'] })
  },
})

// Laravel equivalent with database transactions
DB::transaction(function () use ($item, $data) {
    $item->update($data);
    
    // If something fails here, it will rollback
    event(new ItemUpdated($item));
});
```

### **2. Infinite Queries (Pagination)**
```typescript
// Infinite scroll implementation
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['items', 'infinite'],
  queryFn: ({ pageParam = 1 }) => 
    itemsApi.getAll({ page: pageParam, limit: 12 }),
  getNextPageParam: (lastPage) => {
    return lastPage.pagination.page < lastPage.pagination.pages 
      ? lastPage.pagination.page + 1 
      : undefined
  },
})

// Laravel equivalent with cursor pagination
public function index(Request $request)
{
    return Item::cursorPaginate(12);
}
```

### **3. Parallel Queries**
```typescript
// Fetch multiple independent queries
const dashboardQueries = useQueries({
  queries: [
    {
      queryKey: ['stats', 'items'],
      queryFn: () => statsApi.getItemStats(),
    },
    {
      queryKey: ['stats', 'users'],
      queryFn: () => statsApi.getUserStats(),
    },
    {
      queryKey: ['recent', 'activities'],
      queryFn: () => activitiesApi.getRecent(),
    },
  ],
})

// Laravel equivalent with concurrent requests
$stats = [
    'items' => Item::count(),
    'users' => User::count(),
    'activities' => Activity::recent()->get(),
];
```

## 🎛️ **Query Configuration Options**

### **Caching and Stale Time**
```typescript
const { data } = useQuery({
  queryKey: ['items'],
  queryFn: itemsApi.getAll,
  staleTime: 1000 * 60 * 5, // 5 minutes (like Laravel cache TTL)
  cacheTime: 1000 * 60 * 30, // 30 minutes in memory
  refetchOnWindowFocus: false,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
})

// Laravel cache equivalent
Cache::remember('items', 300, function () {
    return Item::all();
});
```

### **Background Refetching**
```typescript
// Automatic background updates
const { data } = useQuery({
  queryKey: ['items'],
  queryFn: itemsApi.getAll,
  refetchInterval: 1000 * 60, // Refetch every minute
  refetchIntervalInBackground: true, // Even when tab not active
})

// Laravel equivalent with scheduled tasks
// In Kernel.php
$schedule->call(function () {
    Cache::forget('items');
    Cache::remember('items', 300, fn() => Item::all());
})->everyMinute();
```

## 🔧 **Error Handling and Loading States**

### **Comprehensive Error Handling**
```typescript
const { data, isLoading, error, isError, refetch } = useQuery({
  queryKey: ['items'],
  queryFn: itemsApi.getAll,
  retry: (failureCount, error) => {
    // Don't retry on 404 or 403
    if (error.status === 404 || error.status === 403) {
      return false
    }
    return failureCount < 3
  },
  onError: (error) => {
    // Global error handling
    if (error.status === 401) {
      // Redirect to login
      navigate('/login')
    } else {
      toast.error('Failed to load items')
    }
  },
})

// Laravel equivalent
class ItemController extends Controller
{
    public function index()
    {
        try {
            return Item::paginate();
        } catch (Exception $e) {
            Log::error('Failed to fetch items', ['error' => $e->getMessage()]);
            
            return response()->json([
                'error' => 'Failed to load items'
            ], 500);
        }
    }
}
```

### **Loading States and Skeletons**
```typescript
// Different loading states
if (isLoading) return <ItemsSkeleton />
if (isError) return <ErrorMessage error={error} onRetry={refetch} />
if (!data?.items?.length) return <EmptyState />

return <ItemsList items={data.items} />

// Laravel equivalent with view composers
View::composer('items.index', function ($view) {
    $view->with([
        'items' => Item::paginate(),
        'loading' => false,
        'error' => null,
    ]);
});
```

## 🧪 **Testing TanStack Query**

### **Mock Query Client for Tests**
```typescript
// Test setup
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithQuery = (component) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  )
}

// Test implementation
test('loads and displays items', async () => {
  // Mock API response
  jest.spyOn(itemsApi, 'getAll').mockResolvedValue({
    items: [{ id: 1, title: 'Test Item' }]
  })
  
  renderWithQuery(<ItemsList />)
  
  expect(await screen.findByText('Test Item')).toBeInTheDocument()
})

// Laravel equivalent with HTTP tests
public function test_items_index_returns_items()
{
    $items = Item::factory(3)->create();
    
    $response = $this->get('/api/items');
    
    $response->assertStatus(200)
            ->assertJsonCount(3, 'items');
}
```

## 🚀 **Performance Optimization**

### **Query Key Factories**
```typescript
// Centralized query key management
export const itemsKeys = {
  all: ['items'] as const,
  lists: () => [...itemsKeys.all, 'list'] as const,
  list: (filters: ItemFilters) => [...itemsKeys.lists(), { filters }] as const,
  details: () => [...itemsKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemsKeys.details(), id] as const,
}

// Usage
const { data } = useQuery({
  queryKey: itemsKeys.list({ page, search }),
  queryFn: () => itemsApi.getAll({ page, search }),
})

// Invalidation
queryClient.invalidateQueries({ queryKey: itemsKeys.lists() })

// Laravel equivalent with cache tags
Cache::tags(['items', 'list'])->remember($key, 300, $callback);
Cache::tags(['items'])->flush(); // Invalidate all item-related cache
```

### **Selective Query Invalidation**
```typescript
// Precise cache invalidation
const updateItemMutation = useMutation({
  mutationFn: itemsApi.update,
  onSuccess: (updatedItem) => {
    // Update specific item in cache
    queryClient.setQueryData(
      itemsKeys.detail(updatedItem.id), 
      updatedItem
    )
    
    // Invalidate lists that might contain this item
    queryClient.invalidateQueries({ 
      queryKey: itemsKeys.lists(),
      exact: false 
    })
  },
})
```

## 🎯 **Best Practices from Your ItemJS Project**

### **1. Consistent Error Handling**
```typescript
// Global error boundary for queries
const GlobalErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => {
        // Log to monitoring service
        console.error('Query error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

### **2. Loading State Management**
```typescript
// Consistent loading patterns
const useItemsWithLoading = (filters) => {
  const query = useQuery({
    queryKey: itemsKeys.list(filters),
    queryFn: () => itemsApi.getAll(filters),
  })
  
  return {
    ...query,
    isEmpty: !query.isLoading && !query.data?.items?.length,
    hasError: query.isError,
  }
}
```

### **3. Mutation Success Patterns**
```typescript
// Consistent success handling
const useCreateItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: itemsApi.create,
    onSuccess: (newItem) => {
      // Add to cache optimistically
      queryClient.setQueryData(
        itemsKeys.detail(newItem.id),
        newItem
      )
      
      // Invalidate lists
      queryClient.invalidateQueries({ 
        queryKey: itemsKeys.lists() 
      })
      
      // Show success feedback
      toast.success('Item created successfully!')
    },
  })
}
```

## 🎓 **Key Takeaways**

### **TanStack Query vs Laravel Patterns:**

1. **Caching**: TanStack Query's automatic caching ≈ Laravel's Cache facade
2. **Invalidation**: Query key invalidation ≈ Cache tags and selective clearing
3. **Background Updates**: Automatic refetching ≈ Laravel's queue jobs for cache warming
4. **Optimistic Updates**: Client-side optimism ≈ Database transactions with rollback
5. **Error Handling**: Query error boundaries ≈ Laravel's exception handling

### **When to Use TanStack Query:**
- ✅ Server state management (API data)
- ✅ Caching and synchronization
- ✅ Background updates
- ✅ Optimistic updates
- ✅ Loading and error states

### **When NOT to Use:**
- ❌ Local UI state (use useState/useReducer)
- ❌ Form state (use form libraries)
- ❌ Global app state (use Context/Zustand)

## 🚀 **Next Steps**

After mastering TanStack Query:
1. **Explore React Query DevTools** for debugging
2. **Implement offline support** with background sync
3. **Add request deduplication** for performance
4. **Create custom hooks** for common patterns
5. **Integrate with your authentication system**

**Next Tutorial**: `14-shadcn-ui.md` - Learn modern component libraries and design systems.

TanStack Query transforms how you handle server state in React, making it as powerful and intuitive as Laravel's Eloquent for the frontend!
