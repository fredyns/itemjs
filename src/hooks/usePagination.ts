import { useState, useCallback } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  onPageChange?: (page: number) => void
}

interface UsePaginationReturn {
  currentPage: number
  setPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  resetToFirstPage: () => void
  canGoNext: (totalPages: number) => boolean
  canGoPrevious: boolean
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const { initialPage = 1, onPageChange } = options
  
  const [currentPage, setCurrentPage] = useState(initialPage)

  const setPage = useCallback((page: number) => {
    if (page < 1) return
    setCurrentPage(page)
    onPageChange?.(page)
  }, [onPageChange])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => {
      const newPage = prev + 1
      onPageChange?.(newPage)
      return newPage
    })
  }, [onPageChange])

  const previousPage = useCallback(() => {
    setCurrentPage(prev => {
      if (prev <= 1) return prev
      const newPage = prev - 1
      onPageChange?.(newPage)
      return newPage
    })
  }, [onPageChange])

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1)
    onPageChange?.(1)
  }, [onPageChange])

  const canGoNext = useCallback((totalPages: number) => {
    return currentPage < totalPages
  }, [currentPage])

  const canGoPrevious = currentPage > 1

  return {
    currentPage,
    setPage,
    nextPage,
    previousPage,
    resetToFirstPage,
    canGoNext,
    canGoPrevious,
  }
}
