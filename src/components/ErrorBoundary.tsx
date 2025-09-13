import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface Props {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: ErrorInfo
  resetError: () => void
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => (
  <Card className="w-full max-w-md mx-auto mt-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        Something went wrong
      </CardTitle>
      <CardDescription>
        An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {process.env.NODE_ENV === 'development' && error && (
        <details className="text-sm bg-gray-50 p-3 rounded border">
          <summary className="cursor-pointer font-medium">Error Details</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      <Button onClick={resetError} className="w-full">
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </CardContent>
  </Card>
)

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    this.setState({ errorInfo })
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Specific error fallbacks for different components
export const ThreeViewerErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  resetError 
}) => (
  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
    <p className="text-gray-600 text-sm mb-4">Failed to load 3D viewer</p>
    <Button variant="outline" size="sm" onClick={resetError}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Retry
    </Button>
  </div>
)

export const ItemsListErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  resetError 
}) => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center py-8">
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <p className="text-gray-600 mb-4">Failed to load items</p>
      <Button onClick={resetError}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Reload Items
      </Button>
    </CardContent>
  </Card>
)
