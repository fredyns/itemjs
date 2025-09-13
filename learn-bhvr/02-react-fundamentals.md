# 02 - React Fundamentals for Laravel Developers

## 🎯 Learning Goals
- Understand React's component-based architecture
- Learn how React differs from Laravel's MVC pattern
- Master JSX syntax and component composition
- Understand React hooks and state management
- Practice with examples from your ItemJS app

## 📂 Reference Your ItemJS Code
Open these files as you learn React concepts:
- **[ShowItem.tsx](../src/pages/ShowItem.tsx)** - Complete React component with hooks and state
- **[ItemsIndex.tsx](../src/pages/ItemsIndex.tsx)** - List component with search and pagination
- **[Dashboard.tsx](../src/pages/Dashboard.tsx)** - Simple component with data fetching
- **[ThreeViewer.tsx](../src/components/ThreeViewer.tsx)** - Complex component with external libraries
- **[Layout.tsx](../src/components/Layout.tsx)** - Layout component pattern

## 🏗️ React vs Laravel: Architectural Differences

### Laravel MVC Pattern (Familiar):
```
Route → Controller → Model → View (Blade) → Response
```

### React Component Pattern (New):
```
Component → State → Render → User Interaction → State Update → Re-render
```

## 🧩 Components: The Building Blocks

Think of React components as **smart Blade components** that can:
- Hold their own data (state)
- Respond to user interactions
- Update themselves automatically
- Communicate with other components

### 1. **Basic Component Structure**

**Laravel Blade Component:**
```blade
{{-- resources/views/components/item-card.blade.php --}}
<div class="card">
    <h3>{{ $title }}</h3>
    <p>{{ $description }}</p>
    <span>Views: {{ $views }}</span>
</div>
```

**React Component (from your app):**
```typescript
// Functional component with props
interface ItemCardProps {
    title: string
    description: string
    views: number
}

const ItemCard: React.FC<ItemCardProps> = ({ title, description, views }) => {
    return (
        <div className="card">
            <h3>{title}</h3>
            <p>{description}</p>
            <span>Views: {views}</span>
        </div>
    )
}
```

### 2. **JSX: HTML-like Syntax in JavaScript**

**Key Differences from Blade:**

| Blade | JSX | Reason |
|-------|-----|---------|
| `class="btn"` | `className="btn"` | `class` is reserved in JavaScript |
| `{{ $variable }}` | `{variable}` | JavaScript expression syntax |
| `@if($condition)` | `{condition && <div>...</div>}` | JavaScript conditional rendering |
| `@foreach($items as $item)` | `{items.map(item => <div key={item.id}>...)}` | JavaScript array methods |

**From your [ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 127-182):**
```typescript
{data?.items.map((item) => (
    <Link
        key={item.id}  // Required for React's reconciliation
        to="/items/$slug"
        params={{ slug: item.slug }}
        className="group"  // className instead of class
    >
        <Card className="hover:shadow-md transition-shadow cursor-pointer group-hover:bg-accent">
            <CardContent className="p-6 space-y-3">
                {/* JSX comment syntax */}
                <h3 className="font-semibold truncate" title={item.title}>
                    {item.title}  {/* JavaScript expression */}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {getContentSnippet(item.content)}
                </p>
            </CardContent>
        </Card>
    </Link>
))}
```

## 🎣 React Hooks: The Magic of State

Hooks are functions that let you "hook into" React features. Think of them as **Laravel service injections** but for component functionality.

### 1. **useState: Component State**

**Laravel Controller (Stateless):**
```php
class ItemController extends Controller 
{
    public function index(Request $request) 
    {
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        
        $items = Item::when($search, function($query) use ($search) {
            return $query->where('title', 'like', "%{$search}%");
        })->paginate(12);
        
        return view('items.index', compact('items', 'page', 'search'));
    }
}
```

**React Component (Stateful):**

**From your [ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 10-31):**
```typescript
export const ItemsIndex: React.FC = () => {
    // State declarations - like instance variables that persist
    const [page, setPage] = useState(1)           // Current page
    const [search, setSearch] = useState('')      // Search query
    const [searchInput, setSearchInput] = useState('')  // Input field value
    const limit = 12
    
    // When state changes, component re-renders automatically
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearch(searchInput)  // Update search state
        setPage(1)             // Reset to first page
        // Component will re-render with new state
    }
    
    return (
        <form onSubmit={handleSearch}>
            <Input
                type="text"
                placeholder="Search items..."
                value={searchInput}  // Controlled input
                onChange={(e) => setSearchInput(e.target.value)}  // Update on change
            />
        </form>
    )
}
```

### 2. **useEffect: Side Effects and Lifecycle**

**Laravel Controller (Per Request):**
```php
public function show(Item $item) 
{
    // This runs once per request
    $item->increment('view_count');
    $relatedItems = Item::where('category_id', $item->category_id)->take(5)->get();
    
    return view('items.show', compact('item', 'relatedItems'));
}
```

**React Component (Reactive):**
```typescript
// From your ThreeViewer.tsx
export const ThreeViewer: React.FC<ThreeViewerProps> = ({ gltfUrl }) => {
    const [isLoading, setIsLoading] = useState(true)
    const mountRef = useRef<HTMLDivElement>(null)
    
    // useEffect runs after component mounts and when dependencies change
    useEffect(() => {
        if (!mountRef.current) return
        
        // Setup Three.js scene (like constructor logic)
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        
        // Load 3D model
        const loader = new GLTFLoader()
        loader.load(
            gltfUrl,
            (gltf) => {
                scene.add(gltf.scene)
                setIsLoading(false)  // Update state when loaded
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error)
                setIsLoading(false)
            }
        )
        
        // Cleanup function (like destructor)
        return () => {
            renderer.dispose()
            // Clean up resources
        }
    }, [gltfUrl])  // Re-run when gltfUrl changes
    
    // Render based on loading state
    if (isLoading) {
        return <div>Loading 3D model...</div>
    }
    
    return <div ref={mountRef} />
}
```

### 3. **useRef: Direct DOM Access**

**Laravel (Server-side, no DOM):**
```php
// No equivalent - you work with HTML strings
$html = "<div id='three-container'></div>";
```

**React (Client-side DOM manipulation):**
```typescript
// From your ThreeViewer.tsx
const mountRef = useRef<HTMLDivElement>(null)

useEffect(() => {
    if (mountRef.current) {
        // Direct DOM manipulation when needed
        mountRef.current.appendChild(renderer.domElement)
    }
}, [])

return <div ref={mountRef} />  // Attach ref to DOM element
```

## 🔄 Data Flow: Props vs State

### Props (Data Down)
**Like Laravel view data** - passed from parent to child:

```typescript
// Parent component (like Controller passing data to view)
const ShowItem = () => {
    const { data } = useQuery(['item', slug], () => fetchItem(slug))
    
    return (
        <div>
            {/* Passing props down to child component */}
            <ThreeViewer 
                gltfUrl={data.item.gltfFile}
                placeholderImage={data.item.image}
                className="w-full h-full"
            />
        </div>
    )
}

// Child component (like Blade component receiving props)
interface ThreeViewerProps {
    gltfUrl: string
    placeholderImage?: string
    className?: string
}

const ThreeViewer: React.FC<ThreeViewerProps> = ({ 
    gltfUrl, 
    placeholderImage, 
    className 
}) => {
    // Use props to render component
    return <div className={className}>...</div>
}
```

### State (Internal Data)
**Like private class properties** - managed within the component:

```typescript
const ThreeViewer = ({ gltfUrl }) => {
    // Internal state - not visible to parent
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    
    // State changes trigger re-renders
    const handleLoadComplete = () => {
        setIsLoading(false)  // Component will re-render
    }
    
    return (
        <div>
            {isLoading && <div>Loading...</div>}
            {hasError && <div>Error loading model</div>}
        </div>
    )
}
```

## 🎪 Event Handling: Interactive Components

### Laravel Form Handling (Server-side):
```php
// routes/web.php
Route::post('/items/search', [ItemController::class, 'search']);

// ItemController.php
public function search(Request $request) 
{
    $query = $request->input('search');
    $items = Item::where('title', 'like', "%{$query}%")->get();
    return view('items.index', compact('items', 'query'));
}
```

### React Event Handling (Client-side):
```typescript
// From your ItemsIndex.tsx
const ItemsIndex = () => {
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    
    // Event handler function
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()  // Prevent form submission
        setSearch(searchInput)  // Update search state
        setPage(1)  // Reset pagination
        // No page reload - just state update!
    }
    
    const clearSearch = () => {
        setSearch('')
        setSearchInput('')
        setPage(1)
    }
    
    return (
        <form onSubmit={handleSearch}>
            <input
                type="text"
                value={searchInput}  // Controlled component
                onChange={(e) => setSearchInput(e.target.value)}  // Update on every keystroke
                placeholder="Search items..."
            />
            <button type="submit">Search</button>
            {search && (
                <button type="button" onClick={clearSearch}>
                    Clear
                </button>
            )}
        </form>
    )
}
```

## 🔄 Component Lifecycle

### Laravel Request Lifecycle:
```
Request → Middleware → Controller → Model → View → Response → End
```

### React Component Lifecycle:
```
Mount → Render → User Interaction → State Change → Re-render → Unmount
```

**From your ThreeViewer.tsx:**
```typescript
const ThreeViewer = ({ gltfUrl }) => {
    // 1. MOUNT: Component is created
    useEffect(() => {
        // Setup code runs once when component mounts
        const scene = new THREE.Scene()
        const renderer = new THREE.WebGLRenderer()
        
        // 2. SETUP: Initialize Three.js
        setupScene()
        loadModel()
        
        // 3. CLEANUP: Runs when component unmounts
        return () => {
            renderer.dispose()
            cancelAnimationFrame(animationId)
        }
    }, [])
    
    // 4. UPDATE: Runs when gltfUrl changes
    useEffect(() => {
        if (gltfUrl) {
            loadNewModel(gltfUrl)
        }
    }, [gltfUrl])
    
    // 5. RENDER: Returns JSX (runs on every state change)
    return <div ref={mountRef} />
}
```

## 🎨 Conditional Rendering Patterns

### Laravel Blade:
```blade
@if($items->count() > 0)
    @foreach($items as $item)
        <div class="item">{{ $item->title }}</div>
    @endforeach
@else
    <div class="empty">No items found</div>
@endif

@isset($user->avatar)
    <img src="{{ $user->avatar }}" alt="Avatar">
@endisset
```

### React JSX:
```typescript
// From your ItemsIndex.tsx
return (
    <div>
        {/* Conditional rendering with && */}
        {isLoading && (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )}
        
        {/* Conditional rendering with ternary */}
        {error ? (
            <div className="text-destructive">Error loading items</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Array mapping */}
                {data?.items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        )}
        
        {/* Complex conditional */}
        {!isLoading && !error && data?.items.length === 0 && (
            <div className="text-center py-12">
                <p>No items found</p>
                {!search && (
                    <Button asChild>
                        <Link to="/items/new">Add New Item</Link>
                    </Button>
                )}
            </div>
        )}
    </div>
)
```

## 🧠 Mental Model: Reactive Programming

### Laravel (Imperative):
```php
// You tell the system exactly what to do, step by step
$items = Item::all();
if ($request->has('search')) {
    $items = $items->filter(function($item) use ($request) {
        return str_contains($item->title, $request->search);
    });
}
return view('items', ['items' => $items]);
```

### React (Declarative):
```typescript
// You describe what the UI should look like based on state
const ItemsIndex = () => {
    const [search, setSearch] = useState('')
    
    // Data automatically updates when search changes
    const { data } = useQuery(['items', search], () => 
        fetchItems({ search })
    )
    
    // UI automatically updates when data changes
    return (
        <div>
            <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
            />
            {data?.items.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
    )
}
```

## 🏃‍♂️ Practice Exercises

### Exercise 1: Convert Blade to JSX
Convert this Blade template to React JSX:

```blade
<div class="dashboard">
    <h1>Dashboard</h1>
    @if($user->isAdmin())
        <div class="admin-panel">
            <h2>Admin Controls</h2>
            @foreach($adminActions as $action)
                <button onclick="performAction('{{ $action->id }}')">
                    {{ $action->name }}
                </button>
            @endforeach
        </div>
    @endif
    
    <div class="stats">
        <div class="stat">
            <span class="label">Total Items:</span>
            <span class="value">{{ $totalItems }}</span>
        </div>
    </div>
</div>
```

**Solution:**
```typescript
interface DashboardProps {
    user: User
    adminActions: AdminAction[]
    totalItems: number
}

const Dashboard: React.FC<DashboardProps> = ({ user, adminActions, totalItems }) => {
    const handleActionClick = (actionId: string) => {
        performAction(actionId)
    }
    
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            {user.isAdmin && (
                <div className="admin-panel">
                    <h2>Admin Controls</h2>
                    {adminActions.map(action => (
                        <button 
                            key={action.id}
                            onClick={() => handleActionClick(action.id)}
                        >
                            {action.name}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="stats">
                <div className="stat">
                    <span className="label">Total Items:</span>
                    <span className="value">{totalItems}</span>
                </div>
            </div>
        </div>
    )
}
```

### Exercise 2: Understand Your App's State Flow
Look at this code from your `ShowItem.tsx`:

```typescript
const [showAddSubItem, setShowAddSubItem] = useState(false)
const [showSubItem, setShowSubItem] = useState<number | null>(null)

// Later in the JSX:
<button onClick={() => setShowAddSubItem(true)}>
    Add Sub-Item
</button>

{showAddSubItem && (
    <AddSubItemModal
        isOpen={showAddSubItem}
        onClose={() => setShowAddSubItem(false)}
    />
)}
```

**What's happening?**
1. **State Declaration**: Two pieces of state for modal visibility
2. **Event Handler**: Button click updates state
3. **Conditional Rendering**: Modal shows when state is true
4. **State Update**: Modal can close itself by calling the callback

## 🎯 Key Takeaways

1. **Components are functions** that return JSX
2. **State triggers re-renders** automatically
3. **Props flow down**, events flow up
4. **useEffect handles side effects** (API calls, DOM manipulation)
5. **JSX is JavaScript** with HTML-like syntax
6. **Everything is reactive** - when state changes, UI updates

## 🚀 Next Steps

You now understand React fundamentals! Next, we'll dive deep into component architecture using your complex `ThreeViewer` component as an example.

**Next Tutorial**: `03-component-architecture.md` - Learn how to build complex, reusable components.

## 💡 Pro Tips for Laravel Developers

- **Think in components**, not pages
- **State is local** to each component instance
- **Props are immutable** - don't modify them
- **Use keys** for list items (React's optimization)
- **Embrace functional programming** - pure functions and immutability
- **Debug with React DevTools** - like Laravel Debugbar for React
