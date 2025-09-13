# 01 - JavaScript Basics for Laravel Developers

## 🎯 Learning Goals
- Understand modern JavaScript syntax and behavior
- Learn key differences between PHP and JavaScript
- Master concepts essential for React development
- Practice with examples from your ItemJS app

## 📂 Reference Your ItemJS Code
As you learn these concepts, open these files to see real examples:
- **[ItemsIndex.tsx](../src/pages/ItemsIndex.tsx)** - See modern JavaScript patterns in action
- **[ShowItem.tsx](../src/pages/ShowItem.tsx)** - Async operations and event handling
- **[ThreeViewer.tsx](../src/components/ThreeViewer.tsx)** - Complex JavaScript with external libraries
- **[Dashboard.tsx](../src/pages/Dashboard.tsx)** - Data manipulation and array methods

## 🔄 PHP vs JavaScript: Core Differences

### 1. **Variable Declaration**

**PHP (Familiar):**
```php
<?php
$name = "John";
$age = 25;
$items = ["item1", "item2"];
```

**JavaScript (New):**
```javascript
// Modern JavaScript uses const/let instead of var
const name = "John"        // Cannot be reassigned (like final in PHP)
let age = 25              // Can be reassigned
const items = ["item1", "item2"]  // Array contents can still be modified
```

**From your ItemJS app:** [ItemsIndex.tsx](../src/pages/ItemsIndex.tsx) (lines 11-16)
```typescript
const [page, setPage] = useState(1)
const [search, setSearch] = useState('')
const [searchInput, setSearchInput] = useState('')
const limit = 12

const { data, isLoading, error } = useQuery({...})
```

### 2. **Functions: The Heart of JavaScript**

**PHP Functions:**
```php
function calculateTotal($items) {
    $total = 0;
    foreach ($items as $item) {
        $total += $item['price'];
    }
    return $total;
}
```

**JavaScript Functions (Multiple Ways):**
```javascript
// 1. Traditional function
function calculateTotal(items) {
    let total = 0
    for (const item of items) {
        total += item.price
    }
    return total
}

// 2. Arrow function (most common in React)
const calculateTotal = (items) => {
    let total = 0
    for (const item of items) {
        total += item.price
    }
    return total
}

// 3. Short arrow function (one-liner)
const calculateTotal = (items) => items.reduce((sum, item) => sum + item.price, 0)
```

**From your ItemJS app:**
```typescript
// In ShowItem.tsx - Arrow function for event handler
const handleDeleteItem = async () => {
    if (data?.item) {
        await deleteItemMutation.mutateAsync(data.item.id)
    }
}

// In ItemsIndex.tsx - Arrow function for form handler
const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
}
```

## 🎭 JavaScript Behavior Patterns

### 1. **Asynchronous Programming**

**PHP (Synchronous):**
```php
// Everything happens in order
$user = User::find(1);
$posts = $user->posts()->get();
return view('profile', compact('user', 'posts'));
```

**JavaScript (Asynchronous):**
```javascript
// Using async/await (similar to PHP, but non-blocking)
const fetchUserData = async () => {
    const user = await fetch('/api/users/1')
    const posts = await fetch(`/api/users/${user.id}/posts`)
    return { user, posts }
}

// Using Promises (callback-based)
fetch('/api/users/1')
    .then(response => response.json())
    .then(user => fetch(`/api/users/${user.id}/posts`))
    .then(posts => console.log(posts))
```

**From your ItemJS app:**
```typescript
// In ShowItem.tsx - React Query handles async automatically
const { data, isLoading, error } = useQuery({
    queryKey: ['item', slug],
    queryFn: () => itemsApi.getBySlug(slug),  // This is async
})

// Manual async operation
const deleteItemMutation = useMutation({
    mutationFn: itemsApi.delete,  // Async function
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['items'] })
        await navigate({ to: '/items' })
    },
})
```

### 2. **Object and Array Manipulation**

**PHP Arrays:**
```php
$items = collect([
    ['name' => 'Item 1', 'price' => 100],
    ['name' => 'Item 2', 'price' => 200],
]);

$expensive = $items->filter(fn($item) => $item['price'] > 150);
$names = $items->pluck('name');
```

**JavaScript Arrays:**
```javascript
const items = [
    { name: 'Item 1', price: 100 },
    { name: 'Item 2', price: 200 },
]

// Filter (like Laravel collections)
const expensive = items.filter(item => item.price > 150)

// Map (like Laravel's pluck)
const names = items.map(item => item.name)

// Reduce (like Laravel's reduce)
const total = items.reduce((sum, item) => sum + item.price, 0)
```

**From your ItemJS app:**
```typescript
// In Dashboard.tsx - Calculating totals
const totalSubItems = itemsData?.items.reduce((acc, item) => 
    acc + (item._count?.subItems || 0), 0) || 0

// In ItemsIndex.tsx - Mapping over items for display
{data?.items.map((item) => (
    <Link key={item.id} to="/items/$slug" params={{ slug: item.slug }}>
        {/* Item component */}
    </Link>
))}
```

### 3. **Destructuring (Very Important for React)**

**PHP (No equivalent):**
```php
// You have to access array elements individually
$user = ['name' => 'John', 'email' => 'john@example.com'];
$name = $user['name'];
$email = $user['email'];
```

**JavaScript Destructuring:**
```javascript
// Extract values directly
const user = { name: 'John', email: 'john@example.com' }
const { name, email } = user  // Much cleaner!

// Array destructuring
const [first, second] = ['apple', 'banana']

// With default values
const { name, age = 25 } = user
```

**From your ItemJS app (everywhere!):**
```typescript
// In ShowItem.tsx - Destructuring props and query results
export const ShowItem: React.FC = () => {
    const { slug } = useParams({ from: '/items/$slug' })  // Destructuring params
    const { data, isLoading, error } = useQuery({...})    // Destructuring query result
    
    if (error || !data?.item) {  // Optional chaining
        return <div>Error</div>
    }
    
    const { item } = data  // Destructuring data
}

// In ThreeViewer.tsx - Destructuring props
export const ThreeViewer: React.FC<ThreeViewerProps> = ({
    gltfUrl,
    width,
    height,
    className = '',  // Default value
    placeholderImage
}) => {
    // Component logic
}
```

## 🔧 Essential JavaScript Concepts for React

### 1. **Template Literals (String Interpolation)**

**PHP:**
```php
$message = "Hello {$name}, you have {$count} items";
```

**JavaScript:**
```javascript
const message = `Hello ${name}, you have ${count} items`  // Note: backticks!
```

**From your ItemJS app:**
```typescript
// In ItemsIndex.tsx - Dynamic placeholder URLs
return `https://via.placeholder.com/80x80/e5e7eb/6b7280?text=${encodeURIComponent(item.title.charAt(0))}`
```

### 2. **Optional Chaining (Very Important)**

**PHP (Verbose null checking):**
```php
$count = isset($user['posts']) && is_array($user['posts']) ? count($user['posts']) : 0;
```

**JavaScript (Clean optional chaining):**
```javascript
const count = user?.posts?.length ?? 0  // Much cleaner!
```

**From your ItemJS app:**
```typescript
// In ShowItem.tsx - Safe property access
<span>{item._count?.subItems || 0} sub-items</span>

// In Dashboard.tsx - Chaining through potentially undefined objects
const totalSubItems = itemsData?.items.reduce((acc, item) => 
    acc + (item._count?.subItems || 0), 0) || 0
```

### 3. **Spread Operator (Copy and Merge)**

**PHP (Verbose array merging):**
```php
$defaults = ['color' => 'blue', 'size' => 'medium'];
$options = ['color' => 'red'];
$final = array_merge($defaults, $options);
```

**JavaScript (Clean spreading):**
```javascript
const defaults = { color: 'blue', size: 'medium' }
const options = { color: 'red' }
const final = { ...defaults, ...options }  // Much cleaner!

// Also works with arrays
const items1 = [1, 2, 3]
const items2 = [4, 5, 6]
const combined = [...items1, ...items2]  // [1, 2, 3, 4, 5, 6]
```

## 🎪 Event Handling (Critical for React)

**PHP (Server-side form handling):**
```php
if ($_POST['action'] === 'search') {
    $results = Item::where('title', 'like', '%' . $_POST['query'] . '%')->get();
}
```

**JavaScript (Client-side event handling):**
```javascript
// Event handler function
const handleSearch = (event) => {
    event.preventDefault()  // Prevent form submission
    const query = event.target.query.value
    // Perform search logic
}

// Attach to form
<form onSubmit={handleSearch}>
    <input name="query" />
    <button type="submit">Search</button>
</form>
```

**From your ItemJS app:**
```typescript
// In ItemsIndex.tsx - Form submission
const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()  // Prevent page reload
    setSearch(searchInput)  // Update state instead
    setPage(1)
}

// In ThreeViewer.tsx - Button clicks
const handleZoomIn = () => {
    if (controlsRef.current && cameraRef.current) {
        // Zoom logic
    }
}
```

## 🧠 Mental Model Shifts

### 1. **From Request-Response to Reactive**

**Laravel Thinking:**
```
User clicks → Server processes → New page loads
```

**React Thinking:**
```
User clicks → State changes → Component re-renders → UI updates
```

### 2. **From Server State to Client State**

**Laravel:**
```php
// Data lives in database/session
$items = Item::paginate(12);
session(['current_page' => $page]);
```

**React:**
```javascript
// Data lives in component state
const [page, setPage] = useState(1)
const [items, setItems] = useState([])
```

### 3. **From Blade Templates to JavaScript Functions**

**Laravel Blade:**
```blade
@foreach($items as $item)
    <div class="item">{{ $item->title }}</div>
@endforeach
```

**React JSX:**
```javascript
{items.map(item => (
    <div key={item.id} className="item">{item.title}</div>
))}
```

## 🏃‍♂️ Practice Exercises

### Exercise 1: Convert PHP Logic to JavaScript
Convert this PHP function to JavaScript:

```php
function getItemStats($items) {
    $total = count($items);
    $published = array_filter($items, fn($item) => $item['status'] === 'published');
    $avgViews = array_sum(array_column($items, 'views')) / $total;
    
    return [
        'total' => $total,
        'published' => count($published),
        'avgViews' => round($avgViews, 2)
    ];
}
```

**Solution:**
```javascript
const getItemStats = (items) => {
    const total = items.length
    const published = items.filter(item => item.status === 'published')
    const avgViews = items.reduce((sum, item) => sum + item.views, 0) / total
    
    return {
        total,
        published: published.length,
        avgViews: Math.round(avgViews * 100) / 100
    }
}
```

### Exercise 2: Understand Your App's Code
Look at this code from your `ItemsIndex.tsx`:

```typescript
const { data, isLoading, error } = useQuery({
    queryKey: ['items', { page, limit, search }],
    queryFn: () => {
        const params: { page: number; limit: number; search?: string } = { page, limit }
        if (search && search.trim() !== '') {
            params.search = search
        }
        return itemsApi.getAll(params)
    },
})
```

**What's happening here?**
1. **Destructuring**: Extracting `data`, `isLoading`, `error` from useQuery result
2. **Object creation**: Building `params` object conditionally
3. **Optional property**: `search?` means search is optional
4. **Arrow function**: `() => {...}` is the query function
5. **Async operation**: `itemsApi.getAll()` returns a Promise

## 🎯 Key Takeaways

1. **JavaScript is functional** - Functions are first-class citizens
2. **Asynchronous by nature** - Everything can be non-blocking
3. **Destructuring is everywhere** - Learn to read `{ prop1, prop2 }` syntax
4. **Optional chaining saves you** - Use `?.` to avoid errors
5. **State drives UI** - When state changes, UI updates automatically

## 🚀 Next Steps

Now that you understand JavaScript fundamentals, you're ready for React concepts! 

**Next Tutorial**: `02-react-fundamentals.md` - Learn how React uses these JavaScript concepts to build user interfaces.

## 💡 Pro Tips for Laravel Developers

- **Think in functions, not classes** - React favors functional programming
- **Embrace immutability** - Don't modify objects directly, create new ones
- **State is local** - Each component manages its own state
- **Events bubble up** - Child components communicate with parents through callbacks
- **Everything re-renders** - But React is smart about what actually updates in the DOM
