import { useState, useCallback } from 'react'

interface UseSearchOptions {
  onSearch?: (query: string) => void
  onClear?: () => void
  initialValue?: string
}

interface UseSearchReturn {
  searchQuery: string
  searchInput: string
  setSearchInput: (value: string) => void
  handleSearch: (e: React.FormEvent) => void
  clearSearch: () => void
  hasActiveSearch: boolean
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const { onSearch, onClear, initialValue = '' } = options
  
  const [searchQuery, setSearchQuery] = useState(initialValue)
  const [searchInput, setSearchInput] = useState(initialValue)

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    onSearch?.(searchInput)
  }, [searchInput, onSearch])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchInput('')
    onClear?.()
  }, [onClear])

  const hasActiveSearch = searchQuery.trim().length > 0

  return {
    searchQuery,
    searchInput,
    setSearchInput,
    handleSearch,
    clearSearch,
    hasActiveSearch,
  }
}
