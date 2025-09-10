import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { itemsApi } from '../lib/api'
import { Layout } from '../components/Layout'
import { RichTextEditor } from '../components/RichTextEditor'
import { ImageUploadComponent } from '../components/ImageUploadComponent'
import { GltfUploadComponent } from '../components/GltfUploadComponent'

export const AddItem: React.FC = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [gltfFile, setGltfFile] = useState<string | null>(null)
  const [image, setImage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createItemMutation = useMutation({
    mutationFn: itemsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      navigate({ to: `/items/${data.item.slug}` })
    },
    onError: (error: any) => {
      console.error('Create item error:', error)
      setError(error.message || 'Failed to create item')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      await createItemMutation.mutateAsync({
        title: title.trim(),
        content: content || undefined,
        gltfFile: gltfFile || undefined,
        image: image || undefined,
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
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
            <p className="mt-2 text-gray-600">Create a new item with rich content</p>
          </div>
          <button
            onClick={() => navigate({ to: '/items' })}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
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
                  onClick={() => navigate({ to: '/items' })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItemMutation.isPending}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createItemMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Item'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}
