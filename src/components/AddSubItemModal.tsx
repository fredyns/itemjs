import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subItemsApi } from '../lib/api'
import { Modal } from './Modal'
import { GltfUploadComponent } from './GltfUploadComponent'

interface AddSubItemModalProps {
  itemId: number
  isOpen: boolean
  onClose: () => void
}

export const AddSubItemModal: React.FC<AddSubItemModalProps> = ({
  itemId,
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = useState('')
  const [gltfFile, setGltfFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const createSubItemMutation = useMutation({
    mutationFn: subItemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item'] })
      queryClient.invalidateQueries({ queryKey: ['sub-items'] })
      handleClose()
    },
    onError: (error: any) => {
      console.error('Create sub-item error:', error)
      setError(error.message || 'Failed to create sub-item')
    },
  })

  const handleClose = () => {
    setTitle('')
    setGltfFile(null)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!gltfFile) {
      setError('glTF file is required')
      return
    }

    try {
      await createSubItemMutation.mutateAsync({
        itemId,
        title: title.trim(),
        gltfFile,
      })
    } catch (error) {
      // Error is handled by onError callback
    }
  }

  const handleGltfUpload = (fileUrl: string) => {
    setGltfFile(fileUrl)
  }

  const removeGltfFile = () => {
    setGltfFile(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Sub-Item" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="subitem-title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="subitem-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Enter sub-item title"
            required
          />
        </div>

        {/* glTF File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            3D Model (glTF) *
          </label>
          {gltfFile ? (
            <div className="p-4 border border-gray-300 rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800">3D Model Uploaded</p>
                    <p className="text-sm text-green-600">File ready for use</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeGltfFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <GltfUploadComponent onGltfUpload={handleGltfUpload} />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createSubItemMutation.isPending}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createSubItemMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Sub-Item'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
