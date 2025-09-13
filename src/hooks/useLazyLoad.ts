import { useState, useEffect, useRef, useCallback } from 'react'

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface UseLazyLoadReturn {
  isIntersecting: boolean
  ref: React.RefObject<HTMLElement>
  shouldLoad: boolean
  reset: () => void
}

/**
 * Custom hook for lazy loading components based on intersection observer
 */
export const useLazyLoad = ({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}: UseLazyLoadOptions = {}): UseLazyLoadReturn => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const reset = useCallback(() => {
    setIsIntersecting(false)
    setShouldLoad(false)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting
        setIsIntersecting(isVisible)
        
        if (isVisible) {
          setShouldLoad(true)
          
          // If triggerOnce is true, disconnect observer after first intersection
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect()
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    // Start observing
    observerRef.current.observe(element)

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return {
    isIntersecting,
    ref,
    shouldLoad,
    reset,
  }
}

/**
 * Hook for preloading components when they're about to be needed
 */
export const usePreload = (preloadFn: () => Promise<any>, shouldPreload: boolean = false) => {
  const [isPreloaded, setIsPreloaded] = useState(false)
  const [isPreloading, setIsPreloading] = useState(false)

  useEffect(() => {
    if (shouldPreload && !isPreloaded && !isPreloading) {
      setIsPreloading(true)
      preloadFn()
        .then(() => {
          setIsPreloaded(true)
        })
        .catch((error) => {
          console.warn('Failed to preload component:', error)
        })
        .finally(() => {
          setIsPreloading(false)
        })
    }
  }, [shouldPreload, isPreloaded, isPreloading, preloadFn])

  return { isPreloaded, isPreloading }
}
