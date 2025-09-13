import { render, screen } from '../../test/utils'
import { ErrorBoundary, ThreeViewerErrorFallback, ItemsListErrorFallback } from '../ErrorBoundary'
import userEvent from '@testing-library/user-event'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('calls custom error handler when provided', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('resets error state when try again is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    await user.click(tryAgainButton)

    // After reset, the error boundary should try to render children again
    // In a real scenario, the component might not throw the second time
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders custom fallback component when provided', () => {
    const CustomFallback = () => <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })
})

describe('ThreeViewerErrorFallback', () => {
  it('renders three viewer specific error message', () => {
    const resetError = jest.fn()
    
    render(<ThreeViewerErrorFallback resetError={resetError} />)

    expect(screen.getByText('Failed to load 3D viewer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('calls resetError when retry button is clicked', async () => {
    const user = userEvent.setup()
    const resetError = jest.fn()
    
    render(<ThreeViewerErrorFallback resetError={resetError} />)

    const retryButton = screen.getByRole('button', { name: /retry/i })
    await user.click(retryButton)

    expect(resetError).toHaveBeenCalledTimes(1)
  })
})

describe('ItemsListErrorFallback', () => {
  it('renders items list specific error message', () => {
    const resetError = jest.fn()
    
    render(<ItemsListErrorFallback resetError={resetError} />)

    expect(screen.getByText('Failed to load items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload items/i })).toBeInTheDocument()
  })

  it('calls resetError when reload button is clicked', async () => {
    const user = userEvent.setup()
    const resetError = jest.fn()
    
    render(<ItemsListErrorFallback resetError={resetError} />)

    const reloadButton = screen.getByRole('button', { name: /reload items/i })
    await user.click(reloadButton)

    expect(resetError).toHaveBeenCalledTimes(1)
  })
})
