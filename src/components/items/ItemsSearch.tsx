import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface ItemsSearchProps {
  searchInput: string
  search: string
  onSearchInputChange: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  onClearSearch: () => void
}

export const ItemsSearch: React.FC<ItemsSearchProps> = ({
  searchInput,
  search,
  onSearchInputChange,
  onSearch,
  onClearSearch,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSearch} className="flex gap-4" role="search" aria-label="Search items">
          <div className="flex-1">
            <label htmlFor="search-input" className="sr-only">
              Search items
            </label>
            <Input
              id="search-input"
              type="text"
              placeholder="Search items..."
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              aria-describedby={search ? "search-results" : undefined}
            />
          </div>
          <Button type="submit" aria-label="Submit search">
            Search
          </Button>
          {search && (
            <Button 
              type="button" 
              onClick={onClearSearch} 
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
  )
}
