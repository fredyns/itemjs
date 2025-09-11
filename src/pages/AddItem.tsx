import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { itemsApi } from '../lib/api'
import { Layout } from '../components/Layout'
import { RichTextEditor } from '../components/RichTextEditor'
import { ImageUploadComponent } from '../components/ImageUploadComponent'
import { GltfUploadComponent } from '../components/GltfUploadComponent'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

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
          <Button
            onClick={() => navigate({ to: '/items' })}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="space-y-6 p-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter item title"
                  required
                />
              </div>

              {/* Image Upload */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <Label className="text-blue-800 flex items-center gap-2">
                    📷 Image Upload (optional)
                  </Label>
                </CardHeader>
                <CardContent className="pt-0">
                  <ImageUploadComponent
                    onImageUpload={setImage}
                    currentImageUrl={image}
                  />
                </CardContent>
              </Card>

              {/* Content */}
              <div className="space-y-2">
                <Label>
                  Content (optional)
                </Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your content here..."
                />
              </div>

              {/* glTF File Upload */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader className="pb-3">
                  <Label className="text-purple-800 flex items-center gap-2">
                    🎮 3D Model (glTF) - Optional
                  </Label>
                </CardHeader>
                <CardContent className="pt-0">
                  {gltfFile ? (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
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
                          <Button
                            type="button"
                            onClick={removeGltfFile}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <GltfUploadComponent onGltfUpload={handleGltfUpload} />
                  )}
                </CardContent>
              </Card>

              {/* Error Message */}
              {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <p className="text-destructive">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  onClick={() => navigate({ to: '/items' })}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createItemMutation.isPending}
                >
                  {createItemMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Item'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  )
}
