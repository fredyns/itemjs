import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

interface ThreeViewerProps {
  gltfUrl: string
  width?: number
  height?: number
  className?: string
  placeholderImage?: string
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
  gltfUrl,
  width,
  height = 300,
  className = '',
  placeholderImage
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const controlsRef = useRef<OrbitControls>()
  const animationIdRef = useRef<number>()

  // Zoom functions
  const handleZoomIn = () => {
    if (controlsRef.current && cameraRef.current) {
      const controls = controlsRef.current
      const camera = cameraRef.current
      const zoomFactor = 0.8
      
      // Calculate new position closer to target
      const direction = new THREE.Vector3()
      direction.subVectors(camera.position, controls.target)
      direction.multiplyScalar(zoomFactor)
      camera.position.copy(controls.target).add(direction)
      
      controls.update()
    }
  }

  const handleZoomOut = () => {
    if (controlsRef.current && cameraRef.current) {
      const controls = controlsRef.current
      const camera = cameraRef.current
      const zoomFactor = 1.25
      
      // Calculate new position farther from target
      const direction = new THREE.Vector3()
      direction.subVectors(camera.position, controls.target)
      direction.multiplyScalar(zoomFactor)
      camera.position.copy(controls.target).add(direction)
      
      controls.update()
    }
  }

  useEffect(() => {
    if (!mountRef.current) return

    // Get actual container dimensions
    const containerWidth = width || mountRef.current.clientWidth
    const containerHeight = height || mountRef.current.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000)
    camera.position.set(0, 0, 5)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerWidth, containerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 1
    controls.maxDistance = 100
    controlsRef.current = controls

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Load glTF model
    const loader = new GLTFLoader()
    loader.load(
      gltfUrl,
      (gltf) => {
        const model = gltf.scene
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim
        model.scale.multiplyScalar(scale)
        
        model.position.sub(center.multiplyScalar(scale))
        
        // Enable shadows
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        
        scene.add(model)
        
        // Adjust camera position based on model size
        const distance = maxDim * 2
        camera.position.set(distance, distance, distance)
        camera.lookAt(0, 0, 0)
        controls.update()
        
        // Model loaded successfully
        setIsLoading(false)
        setHasError(false)
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
      },
      (error) => {
        console.error('Error loading glTF model:', error)
        setIsLoading(false)
        setHasError(true)
      }
    )

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      controls.dispose()
    }
  }, [gltfUrl, width, height])

  // Handle resize
  useEffect(() => {
    if (rendererRef.current && cameraRef.current && mountRef.current) {
      const containerWidth = width || mountRef.current.clientWidth
      const containerHeight = height || mountRef.current.clientHeight
      
      rendererRef.current.setSize(containerWidth, containerHeight)
      cameraRef.current.aspect = containerWidth / containerHeight
      cameraRef.current.updateProjectionMatrix()
    }
  }, [width, height])

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* Zoom Controls */}
      {!isLoading && !hasError && (
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-sm transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-sm transition-colors"
            title="Zoom Out"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
        </div>
      )}

      {/* Placeholder image while loading */}
      {isLoading && placeholderImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <img
            src={placeholderImage}
            alt="Loading 3D model..."
            className="max-w-full max-h-full object-contain opacity-75"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
            <div className="flex flex-col items-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
              <span className="text-sm font-medium">Loading 3D Model...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading spinner without a placeholder image */}
      {isLoading && !placeholderImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-2"></div>
            <span className="text-sm font-medium">Loading 3D Model...</span>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center text-gray-500">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium">Failed to load 3D model</span>
          </div>
        </div>
      )}
      
      {/* Three.js canvas */}
      <div 
        ref={mountRef} 
        className={`threejs-canvas w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  )
}
