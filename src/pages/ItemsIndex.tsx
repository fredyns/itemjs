import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { itemsApi } from '../lib/api'
import { Layout } from '../components/Layout'

export const ItemsIndex: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const limit = 12

  const { data, isLoading, error } = useQuery({
    queryKey: ['items', { page, limit, search }],
    queryFn: () => itemsApi.getAll({ page, limit, search: search || undefined }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearSearch = () => {
    setSearch('')
    setSearchInput('')
    setPage(1)
  }

  const getImageThumbnail = (item: any) => {
    if (item.image) {
      return item.image
    }
    // Placeholder image
    return `https://via.placeholder.com/80x80/e5e7eb/6b7280?text=${encodeURIComponent(item.title.charAt(0))}`
  }

  const getContentSnippet = (content: string | null) => {
    if (!content) return 'No content available'
    const textContent = content.replace(/<[^>]*>/g, '') // Strip HTML tags
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent
  }

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
        <div className="card">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {search && (
              <button type="button" onClick={clearSearch} className="btn btn-secondary">
                Clear
              </button>
            )}
          </form>
          {search && (
            <p className="mt-2 text-sm text-gray-600">
              Showing results for "{search}"
            </p>
          )}
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <p className="text-red-600">Error loading items. Please try again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add Item Button - First Tile */}
            <Link
              to="/items/new"
              className="card hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-primary-400 flex items-center justify-center min-h-[200px]"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Add New Item</p>
                <p className="text-sm text-gray-500 mt-1">Create a new item</p>
              </div>
            </Link>

            {/* Items */}
            {data?.items.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.slug}`}
                className="card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Image */}
                  <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
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
                    <h3 className="font-semibold text-gray-900 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {getContentSnippet(item.content)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
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
                  <div className="text-xs text-gray-400">
                    {new Date(item.postedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.items.length === 0 && (
          <div className="card text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-2 text-lg font-medium text-gray-900">No items found</p>
            <p className="text-gray-500">
              {search ? 'Try adjusting your search terms' : 'Get started by creating your first item'}
            </p>
            {!search && (
              <Link to="/items/new" className="mt-4 inline-flex items-center btn btn-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Item
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.total)} of {data.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded text-sm ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {data.pagination.pages > 5 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <button
                        onClick={() => setPage(data.pagination.pages)}
                        className={`px-3 py-1 rounded text-sm ${
                          page === data.pagination.pages
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {data.pagination.pages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.pagination.pages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
