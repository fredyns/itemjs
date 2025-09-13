import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { itemsApi } from '../lib/api'
import { Layout } from '../components/Layout'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ErrorBoundary, ItemsListErrorFallback } from '../components/ErrorBoundary'
import { ItemsGridSkeleton } from '../components/ui/skeleton'

export const ItemsIndex: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const limit = 12

  const { data, isLoading, error } = useQuery({
    queryKey: ['items', { page, limit, search }],
    queryFn: () => {
      const params: { page: number; limit: number; search?: string } = { page, limit }
      if (search && search.trim() !== '') {
        params.search = search
      }
      return itemsApi.getAll(params)
    },
  })

  // Memoized event handlers for better performance
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }, [searchInput])

  const clearSearch = useCallback(() => {
    setSearch('')
    setSearchInput('')
    setPage(1)
  }, [])

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Memoized utility functions
  const getImageThumbnail = useCallback((item: any) => {
    if (item.image) {
      return item.image
    }
    // Placeholder image
    return `https://via.placeholder.com/80x80/e5e7eb/6b7280?text=${encodeURIComponent(item.title.charAt(0))}`
  }, [])

  const getContentSnippet = useCallback((content: string | null | undefined) => {
    if (!content) return 'No content available'
    const textContent = content.replace(/<[^>]*>/g, '') // Strip HTML tags
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Items</h1>
            <p className="mt-2 text-gray-600">
              {data?.pagination.total || 0} items total
            </p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4" role="search" aria-label="Search items">
              <div className="flex-1">
                <label htmlFor="search-input" className="sr-only">
                  Search items
                </label>
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Search items..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  aria-describedby={search ? "search-results" : undefined}
                />
              </div>
              <Button type="submit" aria-label="Submit search">
                Search
              </Button>
              {search && (
                <Button 
                  type="button" 
                  onClick={clearSearch} 
                  variant="secondary"
                  aria-label="Clear search results"
                >
                  Clear
                </Button>
              )}
            </form>
            {search && (
              <p id="search-results" className="mt-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                Showing results for "{search}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Items Grid */}
        <ErrorBoundary fallback={ItemsListErrorFallback}>
          {isLoading ? (
            <ItemsGridSkeleton count={limit} />
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-destructive">Error loading items. Please try again.</p>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add Item Button - First Tile */}
            <Link
              to="/items/new"
              className="group"
            >
              <Card className="hover:shadow-md transition-shadow border-2 border-dashed border-border hover:border-primary flex items-center justify-center min-h-[200px] group-hover:bg-accent">
                <CardContent className="text-center p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="font-medium">Add New Item</p>
                  <p className="text-sm text-muted-foreground mt-1">Create a new item</p>
                </CardContent>
              </Card>
            </Link>

            {/* Items */}
            {data?.items.map((item) => (
              <Link
                key={item.id}
                to="/items/$slug"
                params={{ slug: item.slug }}
                className="group"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer group-hover:bg-accent">
                  <CardContent className="p-6 space-y-3">
                    {/* Image */}
                    <div className="w-full h-20 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={getImageThumbnail(item)}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://via.placeholder.com/80x80/e5e7eb/6b7280?text=${encodeURIComponent(item.title.charAt(0))}`
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-semibold truncate" title={item.title}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {getContentSnippet(item.content)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {item.viewCounts}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        {item._count?.subItems || 0}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.postedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.items.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-2 text-lg font-medium">No items found</p>
              <p className="text-muted-foreground">
                {search ? 'Try adjusting your search terms' : 'Get started by creating your first item'}
              </p>
              {!search && (
                <Button asChild className="mt-4">
                  <Link to="/items/new">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Item
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.total)} of {data.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  variant="secondary"
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {data.pagination.pages > 5 && (
                    <>
                      <span className="text-muted-foreground px-2">...</span>
                      <Button
                        onClick={() => setPage(data.pagination.pages)}
                        variant={page === data.pagination.pages ? "default" : "ghost"}
                        size="sm"
                      >
                        {data.pagination.pages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= data.pagination.pages}
                  variant="secondary"
                  aria-label="Go to next page"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
          )}
        </ErrorBoundary>
      </div>
    </Layout>
  )
}
