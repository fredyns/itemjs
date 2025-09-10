import React, { useRef, useState } from 'react'
import { uploadApi } from '../lib/api'

interface GltfUploadComponentProps {
  onGltfUpload: (gltfUrl: string) => void
  className?: string
  children?: React.ReactNode
}

export const GltfUploadComponent: React.FC<GltfUploadComponentProps> = ({
  onGltfUpload,
  className = '',
  children
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateGltfFile = (file: File): boolean => {
    // Validate file type - only allow glTF files
    const allowedExtensions = ['.gltf', '.glb']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(
        `❌ Invalid 3D model file type\n` +
        `✅ Only glTF (.gltf, .glb) files are allowed\n` +
        `💡 Please select a valid glTF or GLB file.`
      )
      return false
    }

    return true
  }

  const handleGltfFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate the glTF file
    if (!validateGltfFile(file)) {
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadApi.uploadFile(file)
      onGltfUpload(result.url)
    } catch (error: any) {
      console.error('glTF upload error:', error)
      setError(error.message || 'glTF upload failed')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleGltfUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".gltf,.glb"
        onChange={handleGltfFileSelect}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={handleGltfUploadClick}
        disabled={isUploading}
        className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 focus:border-purple-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-purple-50"
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
            Uploading 3D Model...
          </div>
        ) : (
          children || (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-purple-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-purple-600 font-medium">
                🎮 Click to upload 3D model
              </p>
              <p className="text-xs text-purple-500">
                .gltf or .glb files only
              </p>
            </div>
          )
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 mb-1">3D Model Upload Error</h3>
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
