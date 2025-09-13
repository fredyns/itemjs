import React from 'react'

/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetrics {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('Navigation timing:', entry)
          }
        })
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // Observe resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 1000) { // Log slow resources
            console.warn('Slow resource:', entry.name, `${entry.duration}ms`)
          }
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    }
  }

  startMeasure(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now()
    this.metrics.set(name, {
      name,
      startTime,
      metadata
    })
  }

  endMeasure(name: string): number | null {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`No measurement started for: ${name}`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    this.metrics.set(name, {
      ...metric,
      endTime,
      duration
    })

    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`)
    return duration
  }

  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name)
  }

  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values())
  }

  clearMetrics(): void {
    this.metrics.clear()
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.clearMetrics()
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * React component performance wrapper
 */
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  const MemoizedComponent = React.memo((props: P) => {
    React.useEffect(() => {
      performanceMonitor.startMeasure(`${componentName}-render`)
      return () => {
        performanceMonitor.endMeasure(`${componentName}-render`)
      }
    }, [componentName])

    return React.createElement(WrappedComponent, props)
  })

  MemoizedComponent.displayName = `withPerformanceTracking(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
  
  return MemoizedComponent
}

/**
 * Bundle size analysis helpers
 */
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return

  // Estimate JavaScript bundle size
  const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[]
  let totalSize = 0

  scripts.forEach(async (script) => {
    try {
      const response = await fetch(script.src, { method: 'HEAD' })
      const size = parseInt(response.headers.get('content-length') || '0')
      totalSize += size
      console.log(`Script: ${script.src} - ${(size / 1024).toFixed(2)}KB`)
    } catch (error) {
      console.warn('Could not analyze script size:', script.src)
    }
  })

  console.log(`Total estimated bundle size: ${(totalSize / 1024).toFixed(2)}KB`)
}

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  const memory = (performance as any).memory
  console.log('Memory usage:', {
    used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
    total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
    limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
  })
}

/**
 * Lazy loading performance helper
 */
export const trackLazyLoadPerformance = (componentName: string) => {
  return {
    onLoadStart: () => {
      performanceMonitor.startMeasure(`lazy-${componentName}`)
    },
    onLoadComplete: () => {
      performanceMonitor.endMeasure(`lazy-${componentName}`)
    }
  }
}

/**
 * Core Web Vitals monitoring
 */
export const initCoreWebVitals = () => {
  if (typeof window === 'undefined') return

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    const lcpObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log('LCP:', entry.startTime)
      })
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const eventEntry = entry as PerformanceEventTiming
        console.log('FID:', eventEntry.processingStart - eventEntry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      list.getEntries().forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      console.log('CLS:', clsValue)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  }
}
