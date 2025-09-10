import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi, Item } from '../lib/api'
import { Modal } from './Modal'
import { RichTextEditor } from './RichTextEditor'
import { ImageUploadComponent } from './ImageUploadComponent'
import { GltfUploadComponent } from './GltfUploadComponent'

interface UpdateItemModalProps {
  item: Item
  isOpen: boolean
  onClose: () => void
}

export const UpdateItemModal: React.FC<UpdateItemModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = useState(item.title)
  const [content, setContent] = useState(item.content || '')
  const [gltfFile, setGltfFile] = useState<string | null>(item.gltfFile || null)
  const [image, setImage] = useState(item.image || '')
  const [error, setError] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const updateItemMutation = useMutation({
    mutationFn: (data: { title?: string; content?: string; gltfFile?: string; image?: string }) =>
      itemsApi.update(item.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
      handleClose()
    },
    onError: (error: any) => {
      console.error('Update item error:', error)
      setError(error.message || 'Failed to update item')
    },
  })

  const handleClose = () => {
    setTitle(item.title)
    setContent(item.content || '')
    setGltfFile(item.gltfFile || null)
    setImage(item.image || '')
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

    try {
      const updates: { title?: string; content?: string; gltfFile?: string; image?: string } = {}
      
      if (title.trim() !== item.title) {
        updates.title = title.trim()
      }
      
      if (content !== (item.content || '')) {
        updates.content = content || undefined
      }
      
      if (gltfFile !== item.gltfFile) {
        updates.gltfFile = gltfFile || undefined
      }
      
      if (image !== (item.image || '')) {
        updates.image = image || undefined
      }

      if (Object.keys(updates).length > 0) {
        await updateItemMutation.mutateAsync(updates)
      } else {
        handleClose()
      }
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Item" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="update-item-title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="update-item-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Enter item title"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            📷 Image Upload (optional)
          </label>
          <ImageUploadComponent
            onImageUpload={setImage}
            currentImageUrl={image}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (optional)
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your content here..."
          />
        </div>

        {/* glTF File Upload */}
        <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
          <label className="block text-sm font-medium text-purple-800 mb-2">
            🎮 3D Model (glTF) - Optional
          </label>
          {gltfFile ? (
            <div className="p-4 border border-gray-300 rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800">3D Model Ready</p>
                    <p className="text-sm text-green-600">
                      {gltfFile === item.gltfFile ? 'Current file' : 'New file uploaded'}
                    </p>
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
            disabled={updateItemMutation.isPending}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateItemMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              'Update Item'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
