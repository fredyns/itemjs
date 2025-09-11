import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { itemsApi } from '../lib/api'
import { Layout } from '../components/Layout'
import { ThreeViewer } from '../components/ThreeViewer'
import { AddSubItemModal } from '../components/AddSubItemModal'
import { ShowSubItemModal } from '../components/ShowSubItemModal'
import { UpdateItemModal } from '../components/UpdateItemModal'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'

export const ShowItem: React.FC = () => {
  const { slug } = useParams({ from: '/items/$slug' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showAddSubItem, setShowAddSubItem] = useState(false)
  const [showSubItem, setShowSubItem] = useState<number | null>(null)
  const [showUpdateItem, setShowUpdateItem] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['item', slug],
    queryFn: () => itemsApi.getBySlug(slug),
  })

  const deleteItemMutation = useMutation({
    mutationFn: itemsApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['items'] })
      await navigate({ to: '/items' })
    },
    onError: (error: any) => {
      console.error('Delete item error:', error)
    },
  })

  const handleDeleteItem = async () => {
    if (data?.item) {
      await deleteItemMutation.mutateAsync(data.item.id)
    }
  }

  const getContentHtml = (content: string | null | undefined) => {
    if (!content) return 'No content available'
    return content
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (error || !data?.item) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-destructive">Item not found or error loading item.</p>
            <Button
              onClick={() => navigate({ to: '/items' })}
              className="mt-4"
            >
              Back to Items
            </Button>
          </CardContent>
        </Card>
      </Layout>
    )
  }

  const { item } = data

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <button
                onClick={() => navigate({ to: '/items' })}
                className="hover:text-primary"
              >
                Items
              </button>
              <span>→</span>
              <span>{item.title}</span>
            </div>
            <h1 className="text-3xl font-bold">{item.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {item.viewCounts} views
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(item.postedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowUpdateItem(true)}
              variant="secondary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* 3D Model - Full Width */}
          {item.gltfFile && (
            <Card>
              <CardHeader>
                <CardTitle>3D Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden rounded-lg border relative" style={{ aspectRatio: '4 / 3', width: '100%' }}>
                  <ThreeViewer
                    gltfUrl={item.gltfFile}
                    placeholderImage={item.image}
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description - Under 3D Model */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getContentHtml(item.content) }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sub-Items Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sub-Items</CardTitle>
              <span className="text-sm text-muted-foreground">
                {item.subItems?.length || 0} sub-items
              </span>
            </div>
          </CardHeader>
          <CardContent>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Add Sub-Item Button */}
            <button
              onClick={() => setShowAddSubItem(true)}
              className="border-2 border-dashed border-border hover:border-primary rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px] transition-colors hover:bg-accent"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-medium">Add Sub-Item</p>
            </button>

            {/* Sub-Items */}
            {item.subItems?.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => setShowSubItem(subItem.id)}
                className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-sm hover:bg-accent transition-all text-left w-full"
              >
                <div className="space-y-2">
                  <h3 className="font-medium truncate">{subItem.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    3D Model
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(subItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>

            {/* Empty State */}
            {(!item.subItems || item.subItems.length === 0) && (
              <div className="text-center py-8 text-muted-foreground col-span-full">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <p className="text-sm">No sub-items yet. Add your first sub-item to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {showAddSubItem && (
          <AddSubItemModal
            itemId={item.id}
            isOpen={showAddSubItem}
            onClose={() => setShowAddSubItem(false)}
          />
        )}

        {showSubItem && (
          <ShowSubItemModal
            subItemId={showSubItem}
            isOpen={!!showSubItem}
            onClose={() => setShowSubItem(null)}
          />
        )}

        {showUpdateItem && (
          <UpdateItemModal
            item={item}
            isOpen={showUpdateItem}
            onClose={() => setShowUpdateItem(false)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{item.title}"? This action cannot be undone and will also delete all associated sub-items.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteItem}
                disabled={deleteItemMutation.isPending}
                variant="destructive"
              >
                {deleteItemMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Item'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
