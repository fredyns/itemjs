# 06 - TypeScript Basics: Type Safety for Laravel Developers

## 📂 Your ItemJS TypeScript Files
We'll analyze these actual TypeScript implementations from your project:
- **[src/lib/api.ts](../src/lib/api.ts)** - API interfaces and type definitions (lines 3-50)
- **[src/components/ThreeViewer.tsx](../src/components/ThreeViewer.tsx)** - Component props and state typing
- **[src/pages/ItemsIndex.tsx](../src/pages/ItemsIndex.tsx)** - React Query with TypeScript
- **[tsconfig.json](../tsconfig.json)** - TypeScript configuration
- **[src/server/index.ts](../src/server/index.ts)** - Backend TypeScript with Hono

## 🎯 Learning Goals
- Understand TypeScript fundamentals and benefits
- Learn interface definitions and type annotations
- Master generic types and utility types
- Practice with your actual ItemJS TypeScript patterns
- Compare TypeScript with PHP type hints and Laravel validation

## 🔧 TypeScript vs PHP: Type Systems Compared

### PHP Type Hints (Familiar):
```php
<?php
// PHP 8+ type declarations
class ItemController extends Controller 
{
    public function store(CreateItemRequest $request): JsonResponse 
    {
        $validated = $request->validated(); // array
        
        $item = Item::create([
            'title' => $validated['title'], // string
            'content' => $validated['content'] ?? null, // string|null
            'user_id' => auth()->id(), // int
        ]);
        
        return response()->json([
            'item' => new ItemResource($item),
            'message' => 'Item created successfully'
        ]);
    }
    
    public function index(Request $request): JsonResponse 
    {
        $page = (int) $request->get('page', 1);
        $search = (string) $request->get('search', '');
        
        $items = Item::where('title', 'like', "%{$search}%")
                    ->paginate(12, ['*'], 'page', $page);
        
        return response()->json($items);
    }
}
```

### TypeScript Equivalents (New):
**From your [src/lib/api.ts](../src/lib/api.ts) (lines 3-50):**
```typescript
// TypeScript interface definitions
export interface User {
  id: number
  email: string
  createdAt: string
}

export interface Item {
  id: number
  title: string
  slug: string
  gltfFile?: string        // Optional property (like nullable in PHP)
  content?: string
  postedAt: string
  image?: string
  viewCounts: number
  userId: number
  user: Pick<User, 'id' | 'email'>  // Utility type - only specific properties
  subItems?: SubItem[]
  _count?: {
    subItems: number
  }
}

export interface PaginatedResponse<T> {  // Generic type
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Function with typed parameters and return type
export const itemsApi = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string 
  }): Promise<PaginatedResponse<Item>> => {
    // Implementation
  }
}
```

## 🏗️ TypeScript Fundamentals

### 1. **Basic Type Annotations**

```typescript
// Primitive types
let title: string = "My Item"
let count: number = 42
let isActive: boolean = true
let data: null = null
let value: undefined = undefined

// Array types
let tags: string[] = ["react", "typescript"]
let numbers: Array<number> = [1, 2, 3]

// Object types
let user: {
  id: number
  name: string
  email?: string  // Optional property
} = {
  id: 1,
  name: "John Doe"
}

// Function types
let processItem: (item: Item) => string = (item) => {
  return `Processing ${item.title}`
}

// Union types (like PHP union types)
let status: "pending" | "completed" | "failed" = "pending"
let id: string | number = "abc123"
```

**PHP Equivalent:**
```php
// PHP 8+ union types and properties
class ItemProcessor 
{
    public string $title = "My Item";
    public int $count = 42;
    public bool $isActive = true;
    public ?string $description = null;  // Nullable
    
    /** @var string[] */
    public array $tags = ["react", "typescript"];
    
    public string|int $id = "abc123";  // Union type
    
    public function processItem(Item $item): string 
    {
        return "Processing {$item->title}";
    }
}
```

### 2. **Interface Definitions**

**From your [src/lib/api.ts](../src/lib/api.ts) (lines 26-34):**
```typescript
// Your SubItem interface
export interface SubItem {
  id: number
  itemId: number
  title: string
  gltfFile: string
  createdAt: string
  updatedAt: string
  item?: Pick<Item, 'id' | 'title'>  // Optional related data
}

// Extending interfaces
interface ExtendedSubItem extends SubItem {
  description?: string
  tags: string[]
}

// Interface for component props
interface ThreeViewerProps {
  gltfUrl?: string
  width?: number
  height?: number
  className?: string
  placeholderImage?: string
}
```

**Laravel Equivalent:**
```php
// Laravel uses classes, arrays, or DTOs
class SubItem extends Model 
{
    protected $fillable = [
        'item_id',
        'title', 
        'gltf_file'
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public function item(): BelongsTo 
    {
        return $this->belongsTo(Item::class);
    }
}

// Or using Data Transfer Objects
class SubItemData 
{
    public function __construct(
        public int $id,
        public int $itemId,
        public string $title,
        public string $gltfFile,
        public Carbon $createdAt,
        public Carbon $updatedAt,
        public ?ItemData $item = null
    ) {}
}
```

### 3. **Generic Types**

```typescript
// Generic function - works with any type
function createApiResponse<T>(data: T, message: string): {
  data: T
  message: string
  success: boolean
} {
  return {
    data,
    message,
    success: true
  }
}

// Usage with different types
const itemResponse = createApiResponse<Item>(myItem, "Item created")
const userResponse = createApiResponse<User>(myUser, "User updated")

// Generic interface
interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  errors?: string[]
}

// Your paginated response is generic
const itemsResponse: PaginatedResponse<Item> = await itemsApi.getAll()
const usersResponse: PaginatedResponse<User> = await usersApi.getAll()
```

**PHP Equivalent:**
```php
// PHP generics are limited, but you can use templates in docblocks
/**
 * @template T
 */
class ApiResponse 
{
    /**
     * @param T $data
     */
    public function __construct(
        public mixed $data,
        public string $message,
        public bool $success = true,
        public array $errors = []
    ) {}
}

/**
 * @return ApiResponse<Item>
 */
public function createItem(array $data): ApiResponse 
{
    $item = Item::create($data);
    return new ApiResponse($item, "Item created");
}
```

### 4. **Utility Types**

**From your actual code patterns:**
```typescript
// Pick - select specific properties
type UserSummary = Pick<User, 'id' | 'email'>

// Omit - exclude specific properties
type CreateItemData = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>

// Partial - make all properties optional
type UpdateItemData = Partial<Pick<Item, 'title' | 'content' | 'gltfFile'>>

// Record - create object type with specific keys
type ItemStatus = Record<'pending' | 'approved' | 'rejected', boolean>

// Your API uses these patterns
const updateItem = (id: number, data: Partial<Item>): Promise<Item> => {
  // Implementation
}
```

**Laravel Equivalent:**
```php
// Laravel uses arrays or specific classes
class UpdateItemRequest extends FormRequest 
{
    public function rules(): array 
    {
        return [
            'title' => 'sometimes|string',
            'content' => 'sometimes|string|nullable',
            'gltf_file' => 'sometimes|string|nullable',
        ];
    }
}

// Or using arrays with validation
$updateData = $request->only(['title', 'content', 'gltf_file']);
$item->update(array_filter($updateData));
```

## 🔍 React Component Typing

### Component Props and State

**From your [src/components/ThreeViewer.tsx](../src/components/ThreeViewer.tsx):**
```typescript
// Props interface
interface ThreeViewerProps {
  gltfUrl?: string
  width?: number
  height?: number
  className?: string
  placeholderImage?: string
}

// Component with typed props
export const ThreeViewer: React.FC<ThreeViewerProps> = ({
  gltfUrl,
  width = 400,
  height = 300,
  className = '',
  placeholderImage
}) => {
  // Typed state
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)
  
  // Typed refs
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  
  // Typed event handlers
  const handleZoomIn = useCallback((): void => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2)
      controlsRef.current.update()
    }
  }, [])
  
  return (
    <div className={className} style={{ width, height }}>
      {/* Component JSX */}
    </div>
  )
}
```

### React Query with TypeScript

**From your [src/pages/ItemsIndex.tsx](../src/pages/ItemsIndex.tsx):**
```typescript
// Typed React Query hook
const { data, isLoading, error } = useQuery<
  PaginatedResponse<Item>,  // Success data type
  ApiError                 // Error type
>({
  queryKey: ['items', { page, limit, search }],
  queryFn: () => itemsApi.getAll({ page, limit, search }),
})

// Typed mutation
const deleteItemMutation = useMutation<
  { message: string },  // Success response
  ApiError,            // Error type
  number              // Variables type (item ID)
>({
  mutationFn: itemsApi.delete,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['items'] })
    await navigate({ to: '/items' })
  },
})
```

## 🛠️ Advanced TypeScript Patterns

### 1. **Discriminated Unions**

```typescript
// API response states
type ApiState<T> = 
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

// Usage with type guards
const handleApiState = <T>(state: ApiState<T>) => {
  switch (state.status) {
    case 'loading':
      return <div>Loading...</div>
      
    case 'success':
      // TypeScript knows state.data exists here
      return <div>Data: {JSON.stringify(state.data)}</div>
      
    case 'error':
      // TypeScript knows state.error exists here
      return <div>Error: {state.error}</div>
  }
}
```

### 2. **Conditional Types**

```typescript
// Create different return types based on input
type ApiMethod<T extends 'GET' | 'POST'> = T extends 'GET' 
  ? () => Promise<Item[]>
  : (data: CreateItemData) => Promise<Item>

// Usage
const getItems: ApiMethod<'GET'> = () => itemsApi.getAll()
const createItem: ApiMethod<'POST'> = (data) => itemsApi.create(data)
```

### 3. **Mapped Types**

```typescript
// Make all properties readonly
type ReadonlyItem = Readonly<Item>

// Make all properties required
type RequiredItem = Required<Item>

// Create form state type
type ItemFormState = {
  [K in keyof Item]: {
    value: Item[K]
    error?: string
    touched: boolean
  }
}
```

## 🔧 TypeScript Configuration

**Your [tsconfig.json](../tsconfig.json) setup:**
```json
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
    "strict": true,                    // Enable all strict checks
    "noUnusedLocals": true,           // Error on unused variables
    "noUnusedParameters": true,       // Error on unused parameters
    "noFallthroughCasesInSwitch": true
  }
}
```

**Key settings explained:**
- `"strict": true` - Enables all strict type checking (like PHP strict types)
- `"noUnusedLocals": true` - Prevents unused variables (like PHP CS Fixer)
- `"jsx": "react-jsx"` - Modern JSX transform
- `"moduleResolution": "bundler"` - Modern module resolution

## 🏃‍♂️ Practice Exercises

### Exercise 1: Type Your Own API
Create TypeScript interfaces for a blog system:

```typescript
// Define interfaces for a blog system
interface BlogPost {
  // Your implementation here
  // Include: id, title, content, author, publishedAt, tags, etc.
}

interface Author {
  // Your implementation here
}

interface Comment {
  // Your implementation here
}

// Create API methods with proper typing
const blogApi = {
  getPosts: (params?: { page?: number; tag?: string }): Promise<PaginatedResponse<BlogPost>> => {
    // Implementation
  },
  
  createPost: (data: Omit<BlogPost, 'id' | 'publishedAt'>): Promise<BlogPost> => {
    // Implementation
  }
}
```

### Exercise 2: Component with Complex Props
Create a data table component with TypeScript:

```typescript
interface Column<T> {
  key: keyof T
  title: string
  render?: (value: T[keyof T], item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  loading?: boolean
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  loading = false
}: DataTableProps<T>) => {
  // Your implementation here
}

// Usage
const itemColumns: Column<Item>[] = [
  { key: 'title', title: 'Title' },
  { key: 'viewCounts', title: 'Views' },
  { 
    key: 'postedAt', 
    title: 'Posted', 
    render: (value) => new Date(value).toLocaleDateString() 
  }
]

<DataTable data={items} columns={itemColumns} onRowClick={handleItemClick} />
```

## 🎯 Key Takeaways

### PHP vs TypeScript Comparison

| Feature | PHP | TypeScript |
|---------|-----|------------|
| **Type Declarations** | `public string $name` | `name: string` |
| **Optional Properties** | `public ?string $desc` | `desc?: string` |
| **Union Types** | `string\|int $id` | `string \| number` |
| **Arrays** | `array $items` | `Item[]` or `Array<Item>` |
| **Generics** | Limited (docblocks) | Full support `<T>` |
| **Interfaces** | Abstract classes | `interface` keyword |
| **Validation** | Runtime (Form Requests) | Compile-time |

### TypeScript Benefits for Laravel Developers

1. **Compile-time safety** - Catch errors before runtime
2. **Better IDE support** - Autocomplete and refactoring
3. **Self-documenting code** - Types serve as documentation
4. **Refactoring confidence** - Safe to rename and restructure
5. **API contract enforcement** - Ensure frontend/backend compatibility

## 🚀 Next Steps

You now understand TypeScript fundamentals! Your ItemJS project demonstrates excellent TypeScript usage:
- **Strong typing** throughout the API layer
- **Component props** properly typed
- **React Query** integration with types
- **Utility types** for flexible APIs

**Next Tutorial**: `07-advanced-patterns.md` - Learn advanced React patterns like custom hooks, HOCs, and performance optimization.

## 💡 Pro Tips for Laravel Developers

- **Start with interfaces** - Define your data structures first (like Laravel models)
- **Use strict mode** - Enable all TypeScript strict checks (like PHP strict types)
- **Type your APIs** - Create interfaces for all API responses (like Laravel Resources)
- **Leverage utility types** - Use `Pick`, `Omit`, `Partial` for flexible types
- **Think compile-time** - TypeScript catches errors at build time, not runtime
- **Use generics** - Make reusable components and functions (like Laravel collections)
