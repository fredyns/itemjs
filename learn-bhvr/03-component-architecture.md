# 03 - Component Architecture: Building Complex Components

## 📂 Your ItemJS Component Files
We'll analyze these actual components from your project:
- **[ThreeViewer.tsx](../src/components/ThreeViewer.tsx)** - Complex 3D viewer component (lines 1-311)
- **[ShowItem.tsx](../src/pages/ShowItem.tsx)** - Item detail page with modals (lines 1-294)
- **[ItemsIndex.tsx](../src/pages/ItemsIndex.tsx)** - List page with pagination (lines 1-271)
- **[Dashboard.tsx](../src/pages/Dashboard.tsx)** - Statistics dashboard (lines 1-187)

## 🎯 Learning Goals
- Understand how to structure complex React components
- Learn component composition and reusability patterns
- Master external library integration in React
- Analyze your ThreeViewer component as a real-world example
- Practice component design principles

## 🏗️ Component Architecture Principles

### Laravel Class Structure (Familiar):
```php
class ItemController extends Controller 
{
    private $itemService;
    private $validationRules;
    
    public function __construct(ItemService $itemService) 
    {
        $this->itemService = $itemService;
        $this->validationRules = ['title' => 'required|string'];
    }
    
    public function show(Item $item) 
    {
        $this->authorize('view', $item);
        $relatedItems = $this->itemService->getRelated($item);
        return view('items.show', compact('item', 'relatedItems'));
    }
    
    private function validateInput($data) 
    {
        return Validator::make($data, $this->validationRules);
    }
}
```

### React Component Structure (New):
```typescript
// Component interface (like Laravel's method signatures)
interface ThreeViewerProps {
    gltfUrl: string
    width?: number
    height?: number
    className?: string
    placeholderImage?: string
}

// Functional component (like a Laravel controller method)
export const ThreeViewer: React.FC<ThreeViewerProps> = ({
    gltfUrl,
    width,
    height,
    className = '',
    placeholderImage
}) => {
    // State (like private properties)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    
    // Refs (like service injections)
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene>()
    const rendererRef = useRef<THREE.WebGLRenderer>()
    
    // Effects (like constructor/destructor logic)
    useEffect(() => {
        // Setup logic
        return () => {
            // Cleanup logic
        }
    }, [])
    
    // Private methods (like Laravel private methods)
    const handleZoomIn = () => {
        // Implementation
    }
    
    // Render method (like Laravel view return)
    return (
        <div className={className}>
            {/* JSX content */}
        </div>
    )
}
```

## 🔍 Deep Dive: Your ThreeViewer Component

Let's analyze your actual **[ThreeViewer.tsx](../src/components/ThreeViewer.tsx)** component section by section:

### 1. **Component Interface Design**

**From your [ThreeViewer.tsx](../src/components/ThreeViewer.tsx) (lines 7-13):**
```typescript
interface ThreeViewerProps {
    gltfUrl?: string             // Optional: URL to 3D model
    width?: number               // Optional: Custom width
    height?: number              // Optional: Custom height
    className?: string           // Optional: CSS classes
    placeholderImage?: string    // Optional: Loading placeholder
}
```

**Laravel Equivalent:**
```php
// Like a Laravel Request class or method parameters
class ShowItemRequest extends FormRequest 
{
    public function rules() 
    {
        return [
            'gltf_url' => 'required|url',
            'width' => 'nullable|integer',
            'height' => 'nullable|integer',
            'css_class' => 'nullable|string',
            'placeholder_image' => 'nullable|url',
        ];
    }
}
```

**Design Principles:**
- **Required props** are essential for component function
- **Optional props** provide customization flexibility
- **Default values** make the component easier to use
- **TypeScript interfaces** provide compile-time safety

### 2. **State Management Strategy**

**From your [ThreeViewer.tsx](../src/components/ThreeViewer.tsx) (lines 15-21):**
```typescript
// UI State - controls what user sees
const [isLoading, setIsLoading] = useState(true)
const [hasError, setHasError] = useState(false)

// Refs - direct access to DOM and Three.js objects
const mountRef = useRef<HTMLDivElement>(null)
const sceneRef = useRef<THREE.Scene | null>(null)
const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
const controlsRef = useRef<OrbitControls | null>(null)
const animationIdRef = useRef<number | null>(null)
```

**Laravel Equivalent:**
```php
class ThreeViewerService 
{
    private bool $isLoading = true;
    private bool $hasError = false;
    private array $containerSize = ['width' => 0, 'height' => 0];
    
    // These would be injected dependencies
    private Scene $scene;
    private Renderer $renderer;
    private Camera $camera;
}
```

**State Categories:**
- **UI State** (`useState`): Controls what the user sees
- **Instance References** (`useRef`): Direct access to objects that persist across renders
- **Computed State**: Derived from props or other state

### 3. **Complex useEffect Patterns**

Your component uses multiple `useEffect` hooks for different concerns:

**From your [ThreeViewer.tsx](../src/components/ThreeViewer.tsx) (lines 23-89):**
```typescript
// Main setup effect - runs when gltfUrl or dimensions change
useEffect(() => {
    if (!gltfUrl || !mountRef.current) {
        setIsLoading(false)
        return
    }

    const initThreeJS = async () => {
        try {
            // Initialize Three.js scene
            const scene = new THREE.Scene()
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
            const renderer = new THREE.WebGLRenderer({ antialias: true })
            
            // Store references
            sceneRef.current = scene
            cameraRef.current = camera
            rendererRef.current = renderer
            
            // Load 3D model
            const loader = new GLTFLoader()
            const gltf = await loader.loadAsync(gltfUrl)
            scene.add(gltf.scene)
            
            setIsLoading(false)
        } catch (error) {
            console.error('Error loading glTF model:', error)
            setHasError(true)
            setIsLoading(false)
        }
    }

    initThreeJS()
    
    // Cleanup function
    return () => {
        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current)
        }
        if (rendererRef.current) {
            rendererRef.current.dispose()
        }
        if (controlsRef.current) {
            controlsRef.current.dispose()
        }
    }
}, [gltfUrl, width, height])  // Dependencies

// Resize effect - runs when container size changes
useEffect(() => {
    if (rendererRef.current && cameraRef.current && containerSize.width > 0) {
        const { width: containerWidth, height: containerHeight } = containerSize
        
        rendererRef.current.setSize(containerWidth, containerHeight)
        cameraRef.current.aspect = containerWidth / containerHeight
        cameraRef.current.updateProjectionMatrix()
    }
}, [containerSize, width, height])
```

**Laravel Equivalent:**
```php
class ThreeViewerService 
{
    public function __construct() 
    {
        // Constructor logic - setup
        $this->initializeScene();
        $this->loadModel();
    }
    
    public function __destruct() 
    {
        // Destructor logic - cleanup
        $this->cleanup();
    }
    
    public function updateSize($width, $height) 
    {
        // Method called when size changes
        $this->renderer->setSize($width, $height);
        $this->camera->updateAspect($width / $height);
    }
}
```

**useEffect Patterns:**
- **Setup Effect**: Initialization logic (constructor-like)
- **Cleanup Effect**: Resource disposal (destructor-like)
- **Dependency Effect**: Runs when specific values change
- **Multiple Effects**: Separate concerns into different effects

### 4. **Event Handler Patterns**

**From your [ThreeViewer.tsx](../src/components/ThreeViewer.tsx) (lines 91-113):**
```typescript
// Zoom functionality with useCallback for performance
const handleZoomIn = useCallback(() => {
    if (controlsRef.current) {
        controlsRef.current.dollyIn(1.2)
        controlsRef.current.update()
    }
}, [])

const handleZoomOut = useCallback(() => {
    if (controlsRef.current) {
        controlsRef.current.dollyOut(1.2)
        controlsRef.current.update()
    }
}, [])

const handleResetView = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
        controlsRef.current.reset()
        controlsRef.current.update()
    }
}, [])
```

**Laravel Equivalent:**
```php
class ThreeViewerController 
{
    public function zoomIn(Request $request) 
    {
        $controls = $this->getControls();
        $camera = $this->getCamera();
        
        if ($controls && $camera) {
            $zoomFactor = 0.8;
            // Zoom logic
            $this->updateCameraPosition($camera, $controls, $zoomFactor);
        }
        
        return response()->json(['status' => 'success']);
    }
}
```

**Event Handler Best Practices:**
- **Null checks**: Always verify refs exist before using
- **Pure functions**: Don't modify props, only use refs and state
- **Descriptive names**: `handleZoomIn` is better than `zoom`
- **Single responsibility**: Each handler does one thing

### 5. **Conditional Rendering Patterns**

**From your [ThreeViewer.tsx](../src/components/ThreeViewer.tsx) (lines 115-311):**
```typescript
// Loading state
if (isLoading) {
    return (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`} 
             style={{ width, height }}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading 3D model...</p>
            </div>
        </div>
    )
}

// Error state
if (hasError) {
    return (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`} 
             style={{ width, height }}>
            <div className="text-center">
                <p className="text-sm text-red-600 mb-2">Failed to load 3D model</p>
                {placeholderImage && (
                    <img src={placeholderImage} alt="Placeholder" className="max-w-full max-h-full" />
                )}
            </div>
        </div>
    )
}

// Success state with controls
return (
    <div className={`relative ${className}`} style={{ width, height }}>
        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
            <button onClick={handleZoomIn} className="p-2 bg-white rounded shadow hover:bg-gray-50">
                <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={handleZoomOut} className="p-2 bg-white rounded shadow hover:bg-gray-50">
                <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={handleResetView} className="p-2 bg-white rounded shadow hover:bg-gray-50">
                <RotateCcw className="w-4 h-4" />
            </button>
        </div>
        
        {/* Three.js canvas container */}
        <div ref={mountRef} className="w-full h-full" />
    </div>
)
```

**Laravel Equivalent (Blade):**
```blade
<div class="relative overflow-hidden {{ $className }}">
    @if(!$isLoading && !$hasError)
        <div class="absolute top-4 right-4 z-10">
            <button onclick="zoomIn()">Zoom In</button>
            <button onclick="zoomOut()">Zoom Out</button>
        </div>
    @endif
    
    @if($isLoading && $placeholderImage)
        <div class="loading-placeholder">
            <img src="{{ $placeholderImage }}" alt="Loading...">
            <div class="loading-overlay">
                <div class="spinner"></div>
                <span>Loading 3D Model...</span>
            </div>
        </div>
    @elseif($isLoading)
        <div class="loading-simple">
            <div class="spinner"></div>
            <span>Loading 3D Model...</span>
        </div>
    @endif
    
    @if($hasError)
        <div class="error-state">
            <svg>...</svg>
            <span>Failed to load 3D model</span>
        </div>
    @endif
    
    <div id="threejs-canvas" class="canvas {{ $isLoading ? 'opacity-0' : 'opacity-100' }}"></div>
</div>
```

**Conditional Rendering Strategies:**
- **Logical AND** (`&&`): Show element if condition is true
- **Ternary operator** (`? :`): Choose between two options
- **Multiple conditions**: Combine with `&&` and `||`
- **Complex states**: Handle loading, error, and success states

## 🧩 Component Composition Patterns

### 1. **Higher-Order Component Pattern**

```typescript
// Wrapper component that adds common functionality
const withLoading = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P & { isLoading: boolean }) => {
        if (props.isLoading) {
            return <div>Loading...</div>
        }
        return <Component {...props} />
    }
}

// Usage
const LoadingThreeViewer = withLoading(ThreeViewer)
```

### 2. **Render Props Pattern**

```typescript
interface ThreeViewerRenderProps {
    isLoading: boolean
    hasError: boolean
    zoomIn: () => void
    zoomOut: () => void
}

const ThreeViewer = ({ 
    gltfUrl, 
    children 
}: { 
    gltfUrl: string
    children: (props: ThreeViewerRenderProps) => React.ReactNode 
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    
    const handleZoomIn = () => { /* implementation */ }
    const handleZoomOut = () => { /* implementation */ }
    
    return (
        <div>
            {children({ isLoading, hasError, zoomIn: handleZoomIn, zoomOut: handleZoomOut })}
            <div ref={mountRef} />
        </div>
    )
}

// Usage
<ThreeViewer gltfUrl="/model.gltf">
    {({ isLoading, hasError, zoomIn, zoomOut }) => (
        <div>
            {isLoading && <div>Loading...</div>}
            {hasError && <div>Error!</div>}
            <button onClick={zoomIn}>Zoom In</button>
            <button onClick={zoomOut}>Zoom Out</button>
        </div>
    )}
</ThreeViewer>
```

### 3. **Custom Hook Pattern**

```typescript
// Extract logic into a custom hook
const useThreeViewer = (gltfUrl: string) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene>()
    
    useEffect(() => {
        // Three.js setup logic
    }, [gltfUrl])
    
    const handleZoomIn = () => { /* implementation */ }
    const handleZoomOut = () => { /* implementation */ }
    
    return {
        mountRef,
        isLoading,
        hasError,
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut
    }
}

// Simplified component
const ThreeViewer = ({ gltfUrl, className }) => {
    const { mountRef, isLoading, hasError, zoomIn, zoomOut } = useThreeViewer(gltfUrl)
    
    return (
        <div className={className}>
            {!isLoading && !hasError && (
                <div>
                    <button onClick={zoomIn}>Zoom In</button>
                    <button onClick={zoomOut}>Zoom Out</button>
                </div>
            )}
            {isLoading && <div>Loading...</div>}
            {hasError && <div>Error!</div>}
            <div ref={mountRef} />
        </div>
    )
}
```

## 🔧 External Library Integration

### Best Practices for Library Integration:

1. **Lifecycle Management**
```typescript
useEffect(() => {
    // Initialize library
    const library = new ExternalLibrary()
    
    // Store reference
    libraryRef.current = library
    
    // Cleanup on unmount
    return () => {
        library.dispose()
        libraryRef.current = null
    }
}, [])
```

2. **Error Handling**
```typescript
const loadExternalResource = async (url: string) => {
    try {
        setIsLoading(true)
        const resource = await externalLibrary.load(url)
        setResource(resource)
        setHasError(false)
    } catch (error) {
        console.error('Failed to load resource:', error)
        setHasError(true)
    } finally {
        setIsLoading(false)
    }
}
```

3. **Performance Optimization**
```typescript
// Debounce expensive operations
const debouncedResize = useMemo(
    () => debounce(() => {
        if (rendererRef.current) {
            rendererRef.current.setSize(width, height)
        }
    }, 100),
    [width, height]
)

useEffect(() => {
    debouncedResize()
}, [width, height, debouncedResize])
```

## 🏃‍♂️ Practice Exercises

### Exercise 1: Simplify Your ThreeViewer
Create a simplified version of your ThreeViewer that only handles basic 3D model loading:

```typescript
interface SimpleThreeViewerProps {
    modelUrl: string
    onLoadComplete?: () => void
    onError?: (error: Error) => void
}

const SimpleThreeViewer: React.FC<SimpleThreeViewerProps> = ({
    modelUrl,
    onLoadComplete,
    onError
}) => {
    // Your implementation here
    // Focus on: state management, useEffect, refs, error handling
}
```

### Exercise 2: Extract Custom Hook
Extract the Three.js logic from your component into a custom hook:

```typescript
const useThreeScene = (modelUrl: string) => {
    // Extract all Three.js related logic here
    // Return: { mountRef, isLoading, hasError, scene }
}

// Then use it in your component
const ThreeViewer = ({ modelUrl }) => {
    const { mountRef, isLoading, hasError } = useThreeScene(modelUrl)
    
    return (
        <div>
            {/* Render UI based on hook state */}
        </div>
    )
}
```

## 🎯 Key Takeaways

1. **Component Architecture**: Structure components like Laravel classes with clear responsibilities
2. **State Management**: Use `useState` for UI state, `useRef` for persistent objects
3. **Effect Management**: Separate concerns into different `useEffect` hooks
4. **Error Handling**: Always handle loading, success, and error states
5. **External Libraries**: Manage lifecycle, cleanup resources, handle errors
6. **Composition**: Break complex components into smaller, reusable pieces

## 🚀 Next Steps

You now understand how to build complex, robust React components! Next, we'll explore state management patterns using your `ItemsIndex` component.

**Next Tutorial**: `04-state-management.md` - Learn advanced state management with React Query and complex UI interactions.

## 💡 Pro Tips for Laravel Developers

- **Think in lifecycle**: Mount → Update → Unmount (like Request → Process → Response)
- **Separate concerns**: Use multiple `useEffect` hooks for different responsibilities
- **Always cleanup**: Dispose of resources in effect cleanup functions
- **Handle all states**: Loading, success, error - just like HTTP responses
- **Compose components**: Build complex UIs from simple, reusable pieces
- **Extract logic**: Use custom hooks like Laravel services for reusable logic
