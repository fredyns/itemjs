# 05 - API Integration: Connecting React to Your Backend

## 📂 Your ItemJS API Files
We'll analyze these actual API implementations from your project:
- **[src/lib/api.ts](../src/lib/api.ts)** - Complete API client with auth, items, sub-items, and upload (lines 1-229)
- **[src/server/index.ts](../src/server/index.ts)** - Backend API server implementation
- **[src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx)** - Authentication context using your API
- **[src/pages/ItemsIndex.tsx](../src/pages/ItemsIndex.tsx)** - React Query integration example

## 🎯 Learning Goals
- Understand API client architecture and design patterns
- Learn authentication and authorization in React apps
- Master React Query for server state management
- Practice error handling and loading states
- Compare React API integration with Laravel HTTP clients

## 🌐 API Architecture Fundamentals

### Laravel HTTP Client (Familiar):
```php
// Laravel API consumption
class ItemService 
{
    private $client;
    
    public function __construct() 
    {
        $this->client = Http::withToken(auth()->user()->api_token)
                           ->baseUrl(config('services.api.base_url'));
    }
    
    public function getItems($page = 1, $search = '') 
    {
        return $this->client->get('/items', [
            'page' => $page,
            'search' => $search
        ])->json();
    }
    
    public function createItem($data) 
    {
        return $this->client->post('/items', $data)->json();
    }
}
```

### React API Client (New):
**From your [src/lib/api.ts](../src/lib/api.ts) (lines 1-94):**
```typescript
// Your API client architecture
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new ApiError(response.status, errorData.error || 'Request failed')
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Network error', error as Error)
  }
}
```

## 🔍 Deep Dive: Your API Client Implementation

### 1. **Type-Safe API Interfaces**

**From your [src/lib/api.ts](../src/lib/api.ts) (lines 3-50):**
```typescript
// Strong typing for API responses
export interface User {
  id: number
  email: string
  createdAt: string
}

export interface Item {
  id: number
  title: string
  slug: string
  gltfFile?: string
  content?: string
  postedAt: string
  image?: string
  viewCounts: number
  userId: number
  user: Pick<User, 'id' | 'email'>
  subItems?: SubItem[]
  _count?: {
    subItems: number
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

**Laravel Equivalent:**
```php
// Laravel uses arrays or Data Transfer Objects
class ItemResource extends JsonResource 
{
    public function toArray($request) 
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'gltf_file' => $this->gltf_file,
            'content' => $this->content,
            'posted_at' => $this->posted_at,
            'image' => $this->image,
            'view_counts' => $this->view_counts,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'sub_items' => SubItemResource::collection($this->whenLoaded('subItems')),
            '_count' => [
                'sub_items' => $this->sub_items_count ?? 0
            ]
        ];
    }
}
```

### 2. **Authentication Integration**

**From your [src/lib/api.ts](../src/lib/api.ts) (lines 96-112):**
```typescript
// Auth API methods
export const authApi = {
  register: (email: string, password: string): Promise<AuthResponse> =>
    makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string): Promise<AuthResponse> =>
    makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (): Promise<{ user: User }> =>
    makeRequest('/auth/me'),
}
```

**Laravel Equivalent:**
```php
// Laravel authentication
class AuthController extends Controller 
{
    public function register(Request $request) 
    {
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);
        
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful'
        ]);
    }
    
    public function login(Request $request) 
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }
}
```

### 3. **CRUD Operations with Type Safety**

**From your [src/lib/api.ts](../src/lib/api.ts) (lines 114-158):**
```typescript
// Items API with full CRUD operations
export const itemsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Item>> => {
    // Filter out undefined values to prevent "undefined" strings in URL
    const filteredParams: Record<string, string> = {}
    if (params?.page !== undefined) filteredParams.page = params.page.toString()
    if (params?.limit !== undefined) filteredParams.limit = params.limit.toString()
    if (params?.search !== undefined && params.search !== '') filteredParams.search = params.search
    
    return makeRequest(`/items?${new URLSearchParams(filteredParams).toString()}`)
  },

  getBySlug: (slug: string): Promise<{ item: Item }> =>
    makeRequest(`/items/${slug}`),

  create: (data: {
    title: string
    content?: string
    gltfFile?: string
    image?: string
  }): Promise<{ item: Item; message: string }> =>
    makeRequest('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: {
    title?: string
    content?: string
    gltfFile?: string
    image?: string
  }): Promise<{ item: Item; message: string }> =>
    makeRequest(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    makeRequest(`/items/${id}`, {
      method: 'DELETE',
    }),
}
```

### 4. **File Upload Handling**

**From your [src/lib/api.ts](../src/lib/api.ts) (lines 194-228):**
```typescript
// File upload with FormData
export const uploadApi = {
  uploadFile: async (file: File): Promise<{
    filename: string
    url: string
    originalName: string
    size: number
    message: string
  }> => {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Note: No Content-Type header for FormData
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new ApiError(response.status, errorData.error || 'Upload failed')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Network error', error as Error)
    }
  },
}
```

## 🔄 React Query Integration

### Using Your API with React Query

**From your [src/pages/ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 21-25):**
```typescript
// React Query integration with your API
const { data, isLoading, error } = useQuery({
  queryKey: ['items', { page, limit, search }],
  queryFn: () => itemsApi.getAll({ page, limit, search }),
})
```

**Advanced React Query Patterns:**
```typescript
// Mutations with optimistic updates
const createItemMutation = useMutation({
  mutationFn: itemsApi.create,
  onSuccess: (data) => {
    // Invalidate and refetch items list
    queryClient.invalidateQueries({ queryKey: ['items'] })
    
    // Optionally add to cache optimistically
    queryClient.setQueryData(['item', data.item.slug], { item: data.item })
    
    // Show success message
    toast.success(data.message)
  },
  onError: (error: ApiError) => {
    toast.error(error.message)
  }
})

// Prefetching for better UX
const prefetchItem = (slug: string) => {
  queryClient.prefetchQuery({
    queryKey: ['item', slug],
    queryFn: () => itemsApi.getBySlug(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## 🛡️ Error Handling Strategies

### 1. **Custom Error Classes**

**From your [src/lib/api.ts](../src/lib/api.ts) (lines 52-57):**
```typescript
class ApiError extends Error {
  constructor(public status: number, message: string, public cause?: Error) {
    super(message)
    this.name = 'ApiError'
  }
}
```

### 2. **Global Error Handling**

```typescript
// Error boundary for API errors
class ApiErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: ApiError }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    if (error instanceof ApiError) {
      return { hasError: true, error }
    }
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          {this.state.error && (
            <p>Error {this.state.error.status}: {this.state.error.message}</p>
          )}
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 3. **React Query Error Handling**

```typescript
// Global error handling with React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 3
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.status === 401) {
            // Redirect to login
            window.location.href = '/login'
          } else {
            toast.error(error.message)
          }
        }
      }
    },
    mutations: {
      onError: (error) => {
        if (error instanceof ApiError) {
          toast.error(error.message)
        }
      }
    }
  }
})
```

## 🔐 Authentication Context Integration

```typescript
// Using your API in Auth Context
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const { user } = await authApi.me()
          setUser(user)
        } catch (error) {
          // Token is invalid, remove it
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
    // Invalidate all queries
    queryClient.clear()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 🏃‍♂️ Practice Exercises

### Exercise 1: Build a Comments API
Extend your API client with comments functionality:

```typescript
export interface Comment {
  id: number
  content: string
  itemId: number
  userId: number
  user: Pick<User, 'id' | 'email'>
  createdAt: string
}

export const commentsApi = {
  getByItemId: (itemId: number): Promise<{ comments: Comment[] }> =>
    makeRequest(`/items/${itemId}/comments`),

  create: (data: { itemId: number; content: string }): Promise<{ comment: Comment }> =>
    makeRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    makeRequest(`/comments/${id}`, {
      method: 'DELETE',
    }),
}
```

### Exercise 2: Implement Offline Support
Add offline capabilities to your API client:

```typescript
const makeRequestWithOffline = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Check if online
  if (!navigator.onLine) {
    // Try to get from cache or queue for later
    throw new ApiError(0, 'You are offline')
  }

  try {
    const result = await makeRequest<T>(endpoint, options)
    // Cache successful responses
    return result
  } catch (error) {
    // Queue failed requests for retry when online
    throw error
  }
}
```

## 🎯 Key Takeaways

### Laravel vs React API Integration

| Aspect | Laravel | React |
|--------|---------|-------|
| **HTTP Client** | `Http::` facade | `fetch()` API |
| **Authentication** | Session/Sanctum | JWT tokens |
| **Error Handling** | Exceptions | Promise rejections |
| **Caching** | Redis/Database | React Query |
| **Validation** | Form Requests | TypeScript interfaces |
| **File Uploads** | `$request->file()` | `FormData` |

### Best Practices

1. **Type Safety**: Use TypeScript interfaces for all API responses
2. **Error Handling**: Create custom error classes and handle different error types
3. **Authentication**: Store tokens securely and handle token refresh
4. **Caching**: Use React Query for intelligent caching and background updates
5. **Loading States**: Always handle loading, success, and error states
6. **Optimistic Updates**: Update UI immediately for better UX

## 🚀 Next Steps

You now understand API integration in React! Your ItemJS API client demonstrates excellent patterns:
- **Type-safe interfaces** for all API responses
- **Centralized authentication** with token management
- **Comprehensive error handling** with custom error classes
- **File upload support** with FormData
- **Clean separation** between API client and React components

**Next Tutorial**: `06-typescript-basics.md` - Learn TypeScript fundamentals and how they enhance your React development.

## 💡 Pro Tips for Laravel Developers

- **Think in promises**: API calls are asynchronous, unlike Laravel's synchronous model
- **Embrace React Query**: It's like having Eloquent relationships that auto-update
- **Handle network errors**: Unlike server-side code, network can fail at any time
- **Use TypeScript**: It provides compile-time safety like Laravel's type hints
- **Cache strategically**: React Query handles this better than manual caching
- **Separate concerns**: Keep API logic separate from component logic
