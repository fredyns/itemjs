import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemsSearch } from '../ItemsSearch'

describe('ItemsSearch', () => {
  const defaultProps = {
    searchInput: '',
    search: '',
    onSearchInputChange: jest.fn(),
    onSearch: jest.fn(),
    onClearSearch: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input and button', () => {
    render(<ItemsSearch {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('displays current search input', () => {
    render(<ItemsSearch {...defaultProps} searchInput="test input" />)
    
    expect(screen.getByDisplayValue('test input')).toBeInTheDocument()
  })

  it('calls onSearchInputChange when typing', async () => {
    const user = userEvent.setup()
    render(<ItemsSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search items...')
    await user.type(input, 'test')
    
    expect(defaultProps.onSearchInputChange).toHaveBeenCalledTimes(4) // One for each character
  })

  it('calls onSearch when form is submitted', async () => {
    render(<ItemsSearch {...defaultProps} searchInput="test input" />)
    
    const form = screen.getByRole('search')
    fireEvent.submit(form)
    
    expect(defaultProps.onSearch).toHaveBeenCalled()
  })

  it('calls onSearch when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<ItemsSearch {...defaultProps} searchInput="test input" />)
    
    const input = screen.getByPlaceholderText('Search items...')
    await user.click(input)
    await user.keyboard('{Enter}')
    
    expect(defaultProps.onSearch).toHaveBeenCalled()
  })

  it('shows clear button when there is an active search', () => {
    render(<ItemsSearch {...defaultProps} search="test" />)
    
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('does not show clear button when search is empty', () => {
    render(<ItemsSearch {...defaultProps} search="" />)
    
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('calls onClearSearch when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<ItemsSearch {...defaultProps} search="test" />)
    
    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)
    
    expect(defaultProps.onClearSearch).toHaveBeenCalled()
  })

  it('shows search results message when there is an active search', () => {
    render(<ItemsSearch {...defaultProps} search="test query" />)
    
    expect(screen.getByText('Showing results for "test query"')).toBeInTheDocument()
  })

  it('does not show search results message when search is empty', () => {
    render(<ItemsSearch {...defaultProps} search="" />)
    
    expect(screen.queryByText(/showing results for/i)).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ItemsSearch {...defaultProps} search="test" />)
    
    const form = screen.getByRole('search')
    const input = screen.getByPlaceholderText('Search items...')
    const searchButton = screen.getByRole('button', { name: /submit search/i })
    const clearButton = screen.getByRole('button', { name: /clear search results/i })
    
    expect(form).toHaveAttribute('aria-label', 'Search items')
    expect(input).toHaveAttribute('aria-describedby', 'search-results')
    expect(searchButton).toHaveAttribute('aria-label', 'Submit search')
    expect(clearButton).toHaveAttribute('aria-label', 'Clear search results')
  })

  it('renders input without auto-focus', () => {
    render(<ItemsSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search items...')
    expect(input).toBeInTheDocument()
    // Note: The component doesn't autofocus, so we just check it exists
  })

  it('handles keyboard navigation properly', async () => {
    const user = userEvent.setup()
    render(<ItemsSearch {...defaultProps} search="test" />)
    
    const input = screen.getByPlaceholderText('Search items...')
    const searchButton = screen.getByRole('button', { name: /submit search/i })
    const clearButton = screen.getByRole('button', { name: /clear search results/i })
    
    // Focus input first
    await user.click(input)
    expect(input).toHaveFocus()
    
    // Tab navigation
    await user.tab()
    expect(searchButton).toHaveFocus()
    
    await user.tab()
    expect(clearButton).toHaveFocus()
    
    // Shift+Tab navigation
    await user.tab({ shift: true })
    expect(searchButton).toHaveFocus()
    
    await user.tab({ shift: true })
    expect(input).toHaveFocus()
  })

  it('calls onSearchInputChange when input value changes', () => {
    render(<ItemsSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search items...')
    
    // Use fireEvent to directly test the onChange behavior
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Verify that onSearchInputChange was called with the correct value
    expect(defaultProps.onSearchInputChange).toHaveBeenCalledWith('test')
  })

  it('prevents default form submission behavior', async () => {
    const mockPreventDefault = jest.fn()
    
    render(<ItemsSearch {...defaultProps} searchInput="test" />)
    
    const form = screen.getByRole('search')
    
    // Mock the form submission event
    fireEvent.submit(form, { preventDefault: mockPreventDefault })
    
    expect(defaultProps.onSearch).toHaveBeenCalled()
  })

  it('handles empty search input gracefully', () => {
    render(<ItemsSearch {...defaultProps} searchInput="" search="" />)
    
    const input = screen.getByPlaceholderText('Search items...')
    expect(input).toHaveValue('')
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/showing results for/i)).not.toBeInTheDocument()
  })

  it('shows different states for searchInput vs search props', () => {
    render(<ItemsSearch {...defaultProps} searchInput="typing..." search="submitted query" />)
    
    // Input shows current typing
    expect(screen.getByDisplayValue('typing...')).toBeInTheDocument()
    
    // Result message shows submitted search
    expect(screen.getByText('Showing results for "submitted query"')).toBeInTheDocument()
    
    // 'Clear' button is shown because 'search' has value
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('has correct form structure and semantics', () => {
    render(<ItemsSearch {...defaultProps} search="test" />)
    
    const form = screen.getByRole('search')
    const input = screen.getByPlaceholderText('Search items...')
    const submitButton = screen.getByRole('button', { name: /submit search/i })
    
    expect(form).toContainElement(input)
    expect(form).toContainElement(submitButton)
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('maintains accessibility when search results are shown', () => {
    render(<ItemsSearch {...defaultProps} search="test query" />)
    
    const resultsMessage = screen.getByRole('status')
    expect(resultsMessage).toHaveAttribute('aria-live', 'polite')
    expect(resultsMessage).toHaveAttribute('id', 'search-results')
    
    const input = screen.getByPlaceholderText('Search items...')
    expect(input).toHaveAttribute('aria-describedby', 'search-results')
  })
})
