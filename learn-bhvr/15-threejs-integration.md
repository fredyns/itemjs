# 15 - Three.js Integration: 3D Graphics in React

## 🎯 Learning Goals
- Master Three.js integration with React for 3D graphics
- Understand WebGL, scenes, cameras, and rendering
- Learn 3D model loading and manipulation
- Apply patterns from your ItemJS ThreeViewer component
- Compare with traditional web graphics and Laravel asset handling

## 📚 What is Three.js?

**Three.js** is a powerful JavaScript library that makes WebGL accessible for creating 3D graphics in web browsers. In your ItemJS project, it's used to display 3D models of items in an interactive viewer.

### 🔄 **Traditional Web vs Three.js Comparison**

| Traditional Web | Three.js Equivalent | Purpose |
|----------------|---------------------|---------|
| `<img>` tags | 3D Models | Display visual content |
| CSS transforms | 3D transformations | Position and rotate |
| Canvas 2D | WebGL/Canvas 3D | Rendering context |
| Image optimization | Model optimization | Performance |
| Responsive images | Responsive 3D scenes | Adaptive display |
| Image galleries | 3D model viewers | Content presentation |

## 🏗️ **Your ItemJS ThreeViewer Implementation**

Let's examine your actual Three.js implementation to understand real-world patterns.

### **ThreeViewer Component Structure**
*Reference: [src/components/ThreeViewer.tsx](../src/components/ThreeViewer.tsx) lines 1-311*

```typescript
// Your actual ThreeViewer component
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

interface ThreeViewerProps {
  gltfUrl?: string
  width?: number
  height?: number
  className?: string
  placeholderImage?: string
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
  gltfUrl,
  width = 400,
  height = 400,
  className = '',
  placeholderImage
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  
  // Refs for Three.js objects
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const controlsRef = useRef<OrbitControls>()
  const modelRef = useRef<THREE.Group>()
```

**Laravel Asset Equivalent:**
```php
// Laravel way of handling 3D assets
class ItemController extends Controller
{
    public function show(Item $item)
    {
        $modelPath = $item->model_path 
            ? Storage::url($item->model_path)
            : null;
            
        return view('items.show', [
            'item' => $item,
            'modelUrl' => $modelPath,
            'placeholderImage' => $item->image_url,
        ]);
    }
}

{{-- In Blade template --}}
@if($modelUrl)
    <div id="three-viewer" data-model-url="{{ $modelUrl }}"></div>
@else
    <img src="{{ $placeholderImage }}" alt="{{ $item->title }}" />
@endif
```

## 🎬 **Three.js Core Concepts**

### **1. Scene Setup**
```typescript
// Your scene initialization pattern
const initScene = useCallback(() => {
  if (!mountRef.current) return

  // Create scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)
  sceneRef.current = scene

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    width / height, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  )
  camera.position.set(0, 0, 5)
  cameraRef.current = camera

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  rendererRef.current = renderer

  // Add to DOM
  mountRef.current.appendChild(renderer.domElement)
}, [width, height])

// Laravel equivalent for asset setup
public function setupAssets()
{
    return [
        'scene' => [
            'background' => '#f0f0f0',
            'lighting' => 'ambient',
        ],
        'camera' => [
            'fov' => 75,
            'aspect' => $width / $height,
            'position' => [0, 0, 5],
        ],
        'renderer' => [
            'antialias' => true,
            'shadows' => true,
        ],
    ];
}
```

### **2. Lighting Setup**
```typescript
// Your lighting configuration
const setupLighting = useCallback(() => {
  if (!sceneRef.current) return

  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  sceneRef.current.add(ambientLight)

  // Directional light for shadows and definition
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  
  // Shadow camera settings
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 50
  directionalLight.shadow.camera.left = -10
  directionalLight.shadow.camera.right = 10
  directionalLight.shadow.camera.top = 10
  directionalLight.shadow.camera.bottom = -10
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  
  sceneRef.current.add(directionalLight)

  // Additional fill light
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
  fillLight.position.set(-10, -10, -5)
  sceneRef.current.add(fillLight)
}, [])
```

### **3. Model Loading**
```typescript
// Your GLTF model loading implementation
const loadModel = useCallback(async () => {
  if (!gltfUrl || !sceneRef.current) return

  setIsLoading(true)
  setHasError(false)

  try {
    const loader = new GLTFLoader()
    
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.load(
        gltfUrl,
        resolve,
        (progress) => {
          // Loading progress callback
          const percentComplete = (progress.loaded / progress.total) * 100
          console.log(`Loading: ${percentComplete}%`)
        },
        reject
      )
    })

    // Remove previous model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current)
    }

    // Process the loaded model
    const model = gltf.scene
    
    // Enable shadows
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        
        // Ensure materials are properly configured
        if (child.material) {
          child.material.needsUpdate = true
        }
      }
    })

    // Center and scale the model
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    model.position.sub(center)
    
    // Scale to fit in view
    const maxDimension = Math.max(size.x, size.y, size.z)
    const scale = 2 / maxDimension
    model.scale.setScalar(scale)

    sceneRef.current.add(model)
    modelRef.current = model

    setIsLoading(false)
  } catch (error) {
    console.error('Error loading model:', error)
    setHasError(true)
    setIsLoading(false)
  }
}, [gltfUrl])

// Laravel equivalent for file handling
class ModelService
{
    public function processModel($file)
    {
        try {
            // Validate file type
            if (!in_array($file->getClientOriginalExtension(), ['gltf', 'glb'])) {
                throw new InvalidFileException('Invalid model format');
            }
            
            // Store file
            $path = $file->store('models', 'public');
            
            // Generate thumbnail (if needed)
            $thumbnail = $this->generateThumbnail($path);
            
            return [
                'path' => Storage::url($path),
                'thumbnail' => $thumbnail,
                'size' => $file->getSize(),
            ];
        } catch (Exception $e) {
            Log::error('Model processing failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
```

### **4. Camera Controls**
```typescript
// Your OrbitControls implementation
const setupControls = useCallback(() => {
  if (!cameraRef.current || !rendererRef.current) return

  const controls = new OrbitControls(
    cameraRef.current, 
    rendererRef.current.domElement
  )
  
  // Configure controls
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = true
  controls.enableRotate = true
  controls.enablePan = true
  
  // Set limits
  controls.maxDistance = 10
  controls.minDistance = 1
  controls.maxPolarAngle = Math.PI // Allow full rotation
  
  // Auto-rotate (optional)
  controls.autoRotate = false
  controls.autoRotateSpeed = 0.5
  
  controlsRef.current = controls
}, [])

// Update controls in animation loop
const animate = useCallback(() => {
  if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return

  // Update controls
  if (controlsRef.current) {
    controlsRef.current.update()
  }

  // Render the scene
  rendererRef.current.render(sceneRef.current, cameraRef.current)
  
  // Continue animation loop
  requestAnimationFrame(animate)
}, [])
```

## 🎮 **Interactive Features**

### **1. Zoom Controls**
```typescript
// Your zoom implementation
const handleZoomIn = useCallback(() => {
  if (controlsRef.current) {
    const newZoom = Math.min(zoomLevel * 1.2, 3)
    setZoomLevel(newZoom)
    
    // Apply zoom to camera
    if (cameraRef.current) {
      cameraRef.current.zoom = newZoom
      cameraRef.current.updateProjectionMatrix()
    }
  }
}, [zoomLevel])

const handleZoomOut = useCallback(() => {
  if (controlsRef.current) {
    const newZoom = Math.max(zoomLevel / 1.2, 0.5)
    setZoomLevel(newZoom)
    
    if (cameraRef.current) {
      cameraRef.current.zoom = newZoom
      cameraRef.current.updateProjectionMatrix()
    }
  }
}, [zoomLevel])

const resetView = useCallback(() => {
  if (controlsRef.current && cameraRef.current) {
    // Reset camera position
    cameraRef.current.position.set(0, 0, 5)
    cameraRef.current.zoom = 1
    cameraRef.current.updateProjectionMatrix()
    
    // Reset controls
    controlsRef.current.reset()
    setZoomLevel(1)
  }
}, [])

// UI Controls
<div className="absolute top-4 right-4 flex flex-col space-y-2">
  <button
    onClick={handleZoomIn}
    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
    aria-label="Zoom in"
  >
    <Plus className="w-4 h-4" />
  </button>
  <button
    onClick={handleZoomOut}
    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
    aria-label="Zoom out"
  >
    <Minus className="w-4 h-4" />
  </button>
  <button
    onClick={resetView}
    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
    aria-label="Reset view"
  >
    <RotateCcw className="w-4 h-4" />
  </button>
</div>
```

### **2. Loading and Error States**
```typescript
// Your loading state implementation
if (isLoading) {
  return (
    <div 
      className={`flex items-center justify-center bg-gray-100 ${className}`}
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </div>
  )
}

if (hasError) {
  return (
    <div 
      className={`flex items-center justify-center bg-gray-100 ${className}`}
      style={{ width, height }}
    >
      <div className="text-center">
        {placeholderImage ? (
          <img 
            src={placeholderImage} 
            alt="Model preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Failed to load 3D model</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Laravel equivalent for error handling
@if($item->model_path)
    <div id="model-viewer" data-model="{{ $item->model_url }}">
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading 3D model...</p>
        </div>
        <div class="error-state" style="display: none;">
            @if($item->image_url)
                <img src="{{ $item->image_url }}" alt="{{ $item->title }}" />
            @else
                <p>Failed to load 3D model</p>
            @endif
        </div>
    </div>
@endif
```

## 🔧 **Performance Optimization**

### **1. Memory Management**
```typescript
// Your cleanup implementation
useEffect(() => {
  return () => {
    // Cleanup Three.js resources
    if (rendererRef.current) {
      rendererRef.current.dispose()
    }
    
    if (sceneRef.current) {
      // Dispose of geometries and materials
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose()
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        }
      })
      
      sceneRef.current.clear()
    }
    
    if (controlsRef.current) {
      controlsRef.current.dispose()
    }
  }
}, [])
```

### **2. Responsive Design**
```typescript
// Your responsive implementation
useEffect(() => {
  const handleResize = () => {
    if (!cameraRef.current || !rendererRef.current) return
    
    const container = mountRef.current
    if (!container) return
    
    const newWidth = container.clientWidth
    const newHeight = container.clientHeight
    
    // Update camera aspect ratio
    cameraRef.current.aspect = newWidth / newHeight
    cameraRef.current.updateProjectionMatrix()
    
    // Update renderer size
    rendererRef.current.setSize(newWidth, newHeight)
  }
  
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

// CSS for responsive container
.three-viewer-container {
  width: 100%;
  height: 400px;
  position: relative;
  
  @media (max-width: 768px) {
    height: 300px;
  }
  
  @media (max-width: 480px) {
    height: 250px;
  }
}
```

## 🎨 **Advanced Three.js Patterns**

### **1. Material Customization**
```typescript
// Enhanced material setup
const setupMaterials = (model: THREE.Group) => {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Enhance existing materials
      if (child.material instanceof THREE.MeshStandardMaterial) {
        child.material.roughness = 0.5
        child.material.metalness = 0.1
        child.material.envMapIntensity = 1.0
      }
      
      // Add custom materials for specific parts
      if (child.name.includes('metal')) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          roughness: 0.2,
          metalness: 0.8,
        })
      }
    }
  })
}
```

### **2. Animation System**
```typescript
// Animation mixer for model animations
const [mixer, setMixer] = useState<THREE.AnimationMixer>()

const setupAnimations = (gltf: any) => {
  if (gltf.animations && gltf.animations.length > 0) {
    const newMixer = new THREE.AnimationMixer(gltf.scene)
    
    // Play all animations
    gltf.animations.forEach((clip: THREE.AnimationClip) => {
      const action = newMixer.clipAction(clip)
      action.play()
    })
    
    setMixer(newMixer)
  }
}

// Update animations in render loop
const animate = useCallback(() => {
  if (mixer) {
    mixer.update(0.016) // 60fps
  }
  
  // ... rest of animation loop
}, [mixer])
```

### **3. Post-Processing Effects**
```typescript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

const setupPostProcessing = () => {
  if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return
  
  const composer = new EffectComposer(rendererRef.current)
  
  // Basic render pass
  const renderPass = new RenderPass(sceneRef.current, cameraRef.current)
  composer.addPass(renderPass)
  
  // Bloom effect
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
  )
  composer.addPass(bloomPass)
  
  return composer
}
```

## 🧪 **Testing Three.js Components**

### **1. Mock Three.js for Tests**
```typescript
// __mocks__/three.js
export const Scene = jest.fn(() => ({
  add: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
}))

export const WebGLRenderer = jest.fn(() => ({
  setSize: jest.fn(),
  render: jest.fn(),
  dispose: jest.fn(),
  domElement: document.createElement('canvas'),
}))

export const PerspectiveCamera = jest.fn(() => ({
  position: { set: jest.fn() },
  updateProjectionMatrix: jest.fn(),
}))

// Test implementation
import { render, screen } from '@testing-library/react'
import { ThreeViewer } from './ThreeViewer'

test('renders loading state initially', () => {
  render(<ThreeViewer gltfUrl="/test-model.gltf" />)
  expect(screen.getByText('Loading 3D model...')).toBeInTheDocument()
})

test('renders error state when model fails to load', async () => {
  // Mock failed load
  const mockLoader = {
    load: jest.fn((url, success, progress, error) => {
      error(new Error('Failed to load'))
    })
  }
  
  render(<ThreeViewer gltfUrl="/invalid-model.gltf" />)
  
  await waitFor(() => {
    expect(screen.getByText('Failed to load 3D model')).toBeInTheDocument()
  })
})
```

## 🎯 **Integration Best Practices**

### **1. Component Composition**
```typescript
// Composable Three.js components
export const ModelViewer = ({ modelUrl, ...props }) => (
  <div className="model-viewer-container">
    <ThreeViewer gltfUrl={modelUrl} {...props} />
    <ModelControls onReset={handleReset} onFullscreen={handleFullscreen} />
    <ModelInfo model={modelData} />
  </div>
)

// Usage in your ItemJS pages
export const ShowItem = () => {
  const { data: item } = useQuery({
    queryKey: ['item', slug],
    queryFn: () => itemsApi.getBySlug(slug),
  })

  return (
    <div className="item-details">
      <div className="item-viewer">
        {item?.model_url ? (
          <ModelViewer 
            modelUrl={item.model_url}
            placeholderImage={item.image_url}
            width={600}
            height={400}
          />
        ) : (
          <img src={item?.image_url} alt={item?.title} />
        )}
      </div>
      <ItemDetails item={item} />
    </div>
  )
}
```

### **2. Performance Monitoring**
```typescript
// Performance tracking
const useThreePerformance = () => {
  const [fps, setFps] = useState(60)
  const [renderTime, setRenderTime] = useState(0)
  
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measurePerformance = () => {
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime
      
      frameCount++
      
      if (frameCount % 60 === 0) {
        setFps(Math.round(1000 / (deltaTime / 60)))
        setRenderTime(deltaTime / 60)
      }
      
      lastTime = currentTime
      requestAnimationFrame(measurePerformance)
    }
    
    measurePerformance()
  }, [])
  
  return { fps, renderTime }
}
```

## 🎓 **Key Takeaways**

### **Three.js vs Traditional Graphics:**

1. **Interactivity**: 3D manipulation vs static images
2. **Performance**: GPU acceleration vs CPU rendering  
3. **File Formats**: GLTF/GLB vs JPG/PNG
4. **Loading**: Async model loading vs immediate image display
5. **Complexity**: 3D scenes vs 2D layouts

### **When to Use Three.js:**
- ✅ Product visualization (like your ItemJS)
- ✅ Interactive 3D experiences
- ✅ Data visualization in 3D
- ✅ Games and simulations
- ✅ Architectural walkthroughs

### **Performance Considerations:**
- 📱 **Mobile optimization** - Lower poly models, reduced effects
- 🔋 **Battery usage** - Limit frame rate when not in focus
- 📦 **File sizes** - Compress models and textures
- 💾 **Memory management** - Proper cleanup and disposal

## 🚀 **Next Steps**

After mastering Three.js integration:
1. **Optimize models** - Use Draco compression and LOD
2. **Add AR/VR support** - WebXR integration
3. **Implement physics** - Cannon.js or Ammo.js
4. **Create animations** - Timeline-based model animations
5. **Build editor tools** - Model positioning and configuration

## 💡 **Production Tips**

### **Model Optimization:**
```bash
# Use gltf-pipeline for optimization
npm install -g gltf-pipeline

# Compress models
gltf-pipeline -i model.gltf -o model-optimized.gltf --draco.compressionLevel 10

# Generate LOD versions
gltf-pipeline -i model.gltf -o model-low.gltf --meshopt.simplification 0.5
```

### **CDN Integration:**
```typescript
// Serve models from CDN
const getModelUrl = (modelPath: string) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://cdn.yourapp.com/models/'
    : '/models/'
  
  return `${baseUrl}${modelPath}`
}
```

Three.js opens up incredible possibilities for interactive 3D experiences in your React applications, just like your ItemJS project demonstrates with its sophisticated 3D model viewer!
