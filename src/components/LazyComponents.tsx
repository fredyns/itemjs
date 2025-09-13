import { lazy, Suspense } from 'react'
import { ThreeViewerSkeleton, ItemsGridSkeleton } from './ui/skeleton'

// Lazy load heavy components
const LazyThreeViewer = lazy(() => 
  import('./ThreeViewer').then(module => ({ default: module.ThreeViewer }))
)

const LazyItemsIndex = lazy(() => 
  import('../pages/ItemsIndex').then(module => ({ default: module.ItemsIndex }))
)

// Wrapper components with proper fallbacks
export const ThreeViewerLazy: React.FC<React.ComponentProps<typeof LazyThreeViewer>> = (props) => (
  <Suspense fallback={<ThreeViewerSkeleton className="w-full h-64" />}>
    <LazyThreeViewer {...props} />
  </Suspense>
)

export const ItemsIndexLazy: React.FC = () => (
  <Suspense fallback={<ItemsGridSkeleton count={12} />}>
    <LazyItemsIndex />
  </Suspense>
)

// Export lazy components for route-based code splitting
export { LazyThreeViewer, LazyItemsIndex }
