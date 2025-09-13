import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'

interface ItemsPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onPrevPage: () => void
  onNextPage: () => void
}

export const ItemsPagination: React.FC<ItemsPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPrevPage,
  onNextPage,
}) => {
  if (totalPages <= 1) return null

  const renderPageNumbers = () => {
    const pages = []
    const showPages = 5 // Show 5 page numbers at most
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    let endPage = Math.min(totalPages, startPage + showPages - 1)
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          onClick={() => onPageChange(1)}
          variant={1 === currentPage ? "default" : "ghost"}
          size="sm"
          aria-label="Go to page 1"
        >
          1
        </Button>
      )
      
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 text-muted-foreground">
            ...
          </span>
        )
      }
    }

    // Add visible page numbers
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          variant={page === currentPage ? "default" : "ghost"}
          size="sm"
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Button>
      )
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 text-muted-foreground">
            ...
          </span>
        )
      }
      
      pages.push(
        <Button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          variant={totalPages === currentPage ? "default" : "ghost"}
          size="sm"
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </Button>
      )
    }

    return pages
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} items (Page {currentPage} of {totalPages})
        </div>

        <div className="flex items-center space-x-2" role="navigation" aria-label="Pagination">
          <Button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            variant="secondary"
            size="sm"
            aria-label="Go to previous page"
          >
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {renderPageNumbers()}
          </div>

          <Button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            variant="secondary"
            size="sm"
            aria-label="Go to next page"
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
