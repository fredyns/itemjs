import React from 'react'
import { renderWithoutRouter, screen, waitFor } from '../../test/utils'
import { ItemsIndex } from '../ItemsIndex'
import { itemsApi } from '@/lib/api'
import userEvent from '@testing-library/user-event'
import { mockPaginatedResponse } from '../../test/utils'

// Mock the API
jest.mock('@/lib/api', () => ({
  itemsApi: {
    getAll: jest.fn()
  }
}))

// Mock the items route to bypass authentication
jest.mock('../../routes/items/index', () => ({
  Route: {
    update: jest.fn().mockReturnValue({
      path: '/items/',
      getParentRoute: jest.fn(),
    }),
  },
}))

// Mock the ErrorBoundary to avoid complexity in tests
jest.mock('../../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ItemsListErrorFallback: () => <div>Items List Error</div>
}))

// Mock the skeleton components
jest.mock('../../components/ui/skeleton', () => ({
  ItemsGridSkeleton: ({ count }: { count: number }) => (
    <div data-testid="items-grid-skeleton">Loading {count} items...</div>
  )
}))

const mockedItemsApi = itemsApi as jest.Mocked<typeof itemsApi>

describe('ItemsIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedItemsApi.getAll.mockResolvedValue(mockPaginatedResponse)
  })

  it('renders page title and items count', async () => {
    renderWithoutRouter(<ItemsIndex />)

    expect(screen.getByRole('heading', { name: 'Items' })).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('1 items total')).toBeInTheDocument()
    })
  })

  it('renders search form with proper accessibility attributes', () => {
    renderWithoutRouter(<ItemsIndex />)

    const searchForm = screen.getByRole('search', { name: 'Search items' })
    expect(searchForm).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search items...')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('id', 'search-input')
    expect(searchInput).toHaveAttribute('placeholder', 'Search items...')

    const submitButton = screen.getByRole('button', { name: 'Submit search' })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('shows loading skeleton while fetching data', () => {
    // Mock a pending promise to keep loading state
    mockedItemsApi.getAll.mockImplementation(() => new Promise(() => {}))
    
    renderWithoutRouter(<ItemsIndex />)

    expect(screen.getByTestId('items-grid-skeleton')).toBeInTheDocument()
    expect(screen.getByText('Loading 12 items...')).toBeInTheDocument()
  })

  it('displays items when data is loaded', async () => {
    renderWithoutRouter(<ItemsIndex />)

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    // Check that the "Add New Item" button is present
    expect(screen.getByRole('link', { name: /add new item/i })).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    const user = userEvent.setup()
    renderWithoutRouter(<ItemsIndex />)

    const searchInput = screen.getByPlaceholderText('Search items...')
    const submitButton = screen.getByRole('button', { name: 'Submit search' })

    // Type in search input
    await user.type(searchInput, 'test query')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockedItemsApi.getAll).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        search: 'test query'
      })
    })

    // Should show search results message
    expect(screen.getByRole('status')).toHaveTextContent('Showing results for "test query"')
    expect(screen.getByRole('button', { name: 'Clear search results' })).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup()
    renderWithoutRouter(<ItemsIndex />)

    const searchInput = screen.getByPlaceholderText('Search items...')
    const submitButton = screen.getByRole('button', { name: 'Submit search' })

    // Perform a search first
    await user.type(searchInput, 'test query')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Clear search results' })).toBeInTheDocument()
    })

    // Clear the search
    const clearButton = screen.getByRole('button', { name: 'Clear search results' })
    await user.click(clearButton)

    expect(searchInput).toHaveValue('')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear search results' })).not.toBeInTheDocument()
  })

  it('handles pagination correctly', async () => {
    const multiPageResponse = {
      ...mockPaginatedResponse,
      pagination: {
        page: 1,
        limit: 12,
        total: 25,
        pages: 3
      }
    }
    mockedItemsApi.getAll.mockResolvedValue(multiPageResponse)

    renderWithoutRouter(<ItemsIndex />)

    await waitFor(() => {
      expect(screen.getByText('25 items total')).toBeInTheDocument()
    })

    // Check pagination controls
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeEnabled()

    // Check page numbers
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 3' })).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    mockedItemsApi.getAll.mockRejectedValue(new Error('API Error'))

    renderWithoutRouter(<ItemsIndex />)

    await waitFor(() => {
      expect(screen.getByText('Error loading items. Please try again.')).toBeInTheDocument()
    })
  })

  it('updates search input value correctly', async () => {
    const user = userEvent.setup()
    renderWithoutRouter(<ItemsIndex />)

    const searchInput = screen.getByPlaceholderText('Search items...')
    
    await user.type(searchInput, 'new search term')
    
    expect(searchInput).toHaveValue('new search term')
  })

  it('resets page to 1 when performing new search', async () => {
    const user = userEvent.setup()
    
    // Start with multi-page response
    const multiPageResponse = {
      ...mockPaginatedResponse,
      pagination: { page: 2, limit: 12, total: 25, pages: 3 }
    }
    mockedItemsApi.getAll.mockResolvedValue(multiPageResponse)

    renderWithoutRouter(<ItemsIndex />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('25 items total')).toBeInTheDocument()
    })

    // Perform search
    const searchInput = screen.getByPlaceholderText('Search items...')
    const submitButton = screen.getByRole('button', { name: 'Submit search' })

    await user.type(searchInput, 'test')
    await user.click(submitButton)

    // Should call API with page 1
    await waitFor(() => {
      expect(mockedItemsApi.getAll).toHaveBeenLastCalledWith({
        page: 1,
        limit: 12,
        search: 'test'
      })
    })
  })

  it('shows empty state when no items found', async () => {
    const emptyResponse = {
      items: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 }
    }
    mockedItemsApi.getAll.mockResolvedValue(emptyResponse)

    renderWithoutRouter(<ItemsIndex />)

    // Wait for loading to complete and content to render
    await waitFor(() => {
      expect(screen.getByText('0 items total')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Wait for the skeleton to disappear and actual content to appear
    await waitFor(() => {
      expect(screen.queryByTestId('items-grid-skeleton')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    // Should show the "Add New Item" links (there are multiple)
    await waitFor(() => {
      const addItemLinks = screen.getAllByRole('link', { name: /add new item/i })
      expect(addItemLinks.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('has proper ARIA attributes for search results', async () => {
    const user = userEvent.setup()
    renderWithoutRouter(<ItemsIndex />)

    const searchInput = screen.getByPlaceholderText('Search items...')
    const submitButton = screen.getByRole('button', { name: 'Submit search' })

    await user.type(searchInput, 'test')
    await user.click(submitButton)

    await waitFor(() => {
      const searchResults = screen.getByRole('status')
      expect(searchResults).toHaveAttribute('aria-live', 'polite')
      expect(searchResults).toHaveAttribute('id', 'search-results')
    })

    // Search input should be described by search results
    expect(searchInput).toHaveAttribute('aria-describedby', 'search-results')
  })
})
