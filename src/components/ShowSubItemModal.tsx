import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subItemsApi } from '../lib/api'
import { Modal } from './Modal'
import { ThreeViewer } from './ThreeViewer'
import { UpdateSubItemModal } from './UpdateSubItemModal'

interface ShowSubItemModalProps {
  subItemId: number
  isOpen: boolean
  onClose: () => void
}

export const ShowSubItemModal: React.FC<ShowSubItemModalProps> = ({
  subItemId,
  isOpen,
  onClose,
}) => {
  const [showUpdate, setShowUpdate] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['sub-item', subItemId],
    queryFn: () => subItemsApi.getById(subItemId),
    enabled: isOpen && !!subItemId,
  })

  const deleteSubItemMutation = useMutation({
    mutationFn: subItemsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item'] })
      queryClient.invalidateQueries({ queryKey: ['sub-items'] })
      onClose()
    },
    onError: (error: any) => {
      console.error('Delete sub-item error:', error)
    },
  })

  const handleDelete = async () => {
    if (data?.subItem) {
      await deleteSubItemMutation.mutateAsync(data.subItem.id)
    }
  }

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Sub-Item" size="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Modal>
    )
  }

  if (error || !data?.subItem) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Sub-Item" size="lg">
        <div className="text-center py-8">
          <p className="text-red-600">Sub-item not found or error loading sub-item.</p>
        </div>
      </Modal>
    )
  }

  const { subItem } = data

  return (
    <>
      <Modal isOpen={isOpen && !showUpdate} onClose={onClose} title={subItem.title} size="lg">
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => setShowUpdate(true)}
              className="btn btn-secondary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>

          {/* 3D Model Viewer */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">3D Model</h3>
            <ThreeViewer
              gltfUrl={subItem.gltfFile}
              width={600}
              height={400}
              className="w-full"
            />
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(subItem.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <span className="ml-2 text-gray-600">
                {new Date(subItem.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 mb-4">
                Are you sure you want to delete this sub-item? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteSubItemMutation.isPending}
                  className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteSubItemMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Sub-Item'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Update Sub-Item Modal */}
      {showUpdate && (
        <UpdateSubItemModal
          subItem={subItem}
          isOpen={showUpdate}
          onClose={() => setShowUpdate(false)}
        />
      )}
    </>
  )
}
