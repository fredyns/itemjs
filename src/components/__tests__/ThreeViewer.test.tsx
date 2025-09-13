import React from 'react'
import { render, screen, waitFor } from '../../test/utils'
import { ThreeViewer } from '../ThreeViewer'
import userEvent from '@testing-library/user-event'

// Mock the ErrorBoundary to avoid complexity in tests
jest.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ThreeViewerErrorFallback: () => <div>ThreeViewer Error</div>
}))

describe('ThreeViewer', () => {
  const defaultProps = {
    gltfUrl: 'https://example.com/test-model.gltf',
    width: 400,
    height: 300,
    className: 'test-class'
  }

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('renders with correct accessibility attributes', () => {
    render(<ThreeViewer {...defaultProps} />)

    const container = screen.getByRole('img')
    expect(container).toHaveAttribute('aria-label', `3D model viewer for ${defaultProps.gltfUrl}`)
    expect(container).toHaveAttribute('aria-live', 'polite')
    expect(container).toHaveAttribute('aria-busy', 'true') // Initially loading
  })

  it('applies custom className and styling', () => {
    render(<ThreeViewer {...defaultProps} />)

    const container = screen.getByRole('img')
    expect(container).toHaveClass('relative', 'overflow-hidden', 'test-class')
    expect(container).toHaveStyle({
      height: '100%',
      width: '100%'
    })
  })

  it('shows loading state initially', () => {
    render(<ThreeViewer {...defaultProps} />)

    const container = screen.getByRole('img')
    expect(container).toHaveAttribute('aria-busy', 'true')
  })

  it('displays placeholder image when provided during loading', () => {
    const placeholderImage = 'https://example.com/placeholder.jpg'
    render(<ThreeViewer {...defaultProps} placeholderImage={placeholderImage} />)

    const placeholder = screen.getByAltText('Loading 3D model...')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toHaveAttribute('src', placeholderImage)
    expect(screen.getByText('Loading 3D Model...')).toBeInTheDocument()
  })

  it('shows zoom controls after loading completes', async () => {
    render(<ThreeViewer {...defaultProps} />)

    // Wait for loading to complete (mocked to resolve after 100ms)
    await waitFor(() => {
      expect(screen.getByRole('toolbar', { name: '3D viewer controls' })).toBeInTheDocument()
    }, { timeout: 200 })

    expect(screen.getByRole('button', { name: 'Zoom in to 3D model' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zoom out from 3D model' })).toBeInTheDocument()
  })

  it('zoom controls have proper accessibility attributes', async () => {
    render(<ThreeViewer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })

    const zoomInButton = screen.getByRole('button', { name: 'Zoom in to 3D model' })
    const zoomOutButton = screen.getByRole('button', { name: 'Zoom out from 3D model' })

    expect(zoomInButton).toHaveAttribute('type', 'button')
    expect(zoomInButton).toHaveAttribute('title', 'Zoom In')
    expect(zoomInButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500')

    expect(zoomOutButton).toHaveAttribute('type', 'button')
    expect(zoomOutButton).toHaveAttribute('title', 'Zoom Out')
    expect(zoomOutButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500')
  })

  it('zoom controls are interactive', async () => {
    const user = userEvent.setup()
    render(<ThreeViewer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })

    const zoomInButton = screen.getByRole('button', { name: 'Zoom in to 3D model' })
    const zoomOutButton = screen.getByRole('button', { name: 'Zoom out from 3D model' })

    // Test that buttons are clickable (mocked functions won't throw)
    await user.click(zoomInButton)
    await user.click(zoomOutButton)

    // No errors should be thrown
    expect(zoomInButton).toBeInTheDocument()
    expect(zoomOutButton).toBeInTheDocument()
  })

  it('handles different container sizes', () => {
    const { rerender } = render(<ThreeViewer {...defaultProps} width={800} height={600} />)

    let container = screen.getByRole('img')
    expect(container).toBeInTheDocument()

    // Rerender with different dimensions
    rerender(<ThreeViewer {...defaultProps} width={1200} height={800} />)

    container = screen.getByRole('img')
    expect(container).toBeInTheDocument()
  })

  it('updates aria-busy when loading state changes', async () => {
    render(<ThreeViewer {...defaultProps} />)

    const container = screen.getByRole('img')
    expect(container).toHaveAttribute('aria-busy', 'true')

    // Wait for loading to complete
    await waitFor(() => {
      expect(container).toHaveAttribute('aria-busy', 'false')
    }, { timeout: 200 })
  })

  it('handles resize events properly', async () => {
    render(<ThreeViewer {...defaultProps} />)

    // Simulate window resize
    global.dispatchEvent(new Event('resize'))

    // Component should still be rendered without errors
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<ThreeViewer {...defaultProps} />)

    // Should not throw errors on unmount
    expect(() => unmount()).not.toThrow()
  })

  it('handles missing gltfUrl gracefully', () => {
    // Test with empty gltfUrl
    render(<ThreeViewer {...defaultProps} gltfUrl="" />)

    const container = screen.getByRole('img')
    expect(container).toHaveAttribute('aria-label', '3D model viewer for ')
  })

  it('SVG icons have proper accessibility attributes', async () => {
    render(<ThreeViewer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })

    const svgIcons = document.querySelectorAll('svg')
    svgIcons.forEach(svg => {
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
