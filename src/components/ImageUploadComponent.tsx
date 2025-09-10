import React, { useRef, useState } from 'react'
import { uploadApi } from '../lib/api'

interface ImageUploadComponentProps {
  onImageUpload: (imageUrl: string) => void
  currentImageUrl?: string
  className?: string
}

export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  onImageUpload,
  currentImageUrl,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateImageFile = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // Check file type - only allow image files
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png']
      
      if (!allowedImageTypes.includes(file.type)) {
        const actualType = file.type || 'unknown'
        reject(new Error(
          `❌ Invalid image file type: "${actualType}"\n` +
          `✅ Only JPG, JPEG, and PNG image files are supported.\n` +
          `💡 Please select a valid image file.`
        ))
        return
      }

      // Check file size (1MB = 1024 * 1024 bytes)
      const maxSizeBytes = 1024 * 1024 // 1MB
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      
      if (file.size > maxSizeBytes) {
        reject(new Error(
          `❌ Image file too large: ${fileSizeMB}MB\n` +
          `✅ Maximum allowed size: 1.00MB\n` +
          `💡 Try compressing your image or reducing its quality.`
        ))
        return
      }

      // Check image dimensions
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        
        if (img.width > 2024 || img.height > 2024) {
          reject(new Error(
            `❌ Image dimensions too large: ${img.width}×${img.height} pixels\n` +
            `✅ Maximum allowed dimensions: 2024×2024 pixels\n` +
            `💡 Try resizing your image to fit within the size limits.`
          ))
          return
        }
        
        resolve(true)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error(
          `❌ Unable to process image file\n` +
          `✅ Please ensure the file is a valid image\n` +
          `💡 The file may be corrupted or in an unsupported format.`
        ))
      }
      
      img.src = objectUrl
    })
  }

  const handleImageFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Validate the image file
      await validateImageFile(file)
      
      // Create preview
      const previewObjectUrl = URL.createObjectURL(file)
      setPreviewUrl(previewObjectUrl)
      
      // Upload the image file
      const result = await uploadApi.uploadFile(file)
      onImageUpload(result.url)
      
      // Clean up the preview URL since we now have the uploaded URL
      URL.revokeObjectURL(previewObjectUrl)
      setPreviewUrl(result.url)
      
    } catch (error: any) {
      console.error('Image upload error:', error)
      setError(error.message || 'Image upload failed')
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageUpload('')
    setError(null)
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
        onChange={handleImageFileSelect}
        className="hidden"
      />
      
      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Image preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              onError={() => {
                setPreviewUrl(null)
                setError('Failed to load image')
              }}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              title="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={handleImageUploadClick}
            disabled={isUploading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Change Image'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleImageUploadClick}
          disabled={isUploading}
          className="w-full p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 focus:border-blue-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-50"
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              Uploading Image...
            </div>
          ) : (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-blue-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-blue-600 font-medium">
                📷 Click to upload image
              </p>
              <p className="text-xs text-blue-500">
                JPG, JPEG, or PNG • Max 1MB • Max 2024×2024px
              </p>
            </div>
          )}
        </button>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 mb-1">Image Upload Error</h3>
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
