import { Hono } from 'hono'
import { authMiddleware } from '../lib/auth'
import fs from 'fs/promises'
import path from 'path'

export const uploadRoutes = new Hono()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'storage', 'uploads')
const ensureUploadsDir = async () => {
  try {
    await fs.access(uploadsDir)
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true })
  }
}

// Upload file (protected)
uploadRoutes.post('/', authMiddleware, async (c) => {
  try {
    await ensureUploadsDir()
    
    const body = await c.req.parseBody()
    const file = body['file'] as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Validate file type for both images and glTF files
    const fileExtension = path.extname(file.name).toLowerCase()
    
    // Define allowed file types
    const imageExtensions = ['.jpg', '.jpeg', '.png']
    const gltfExtensions = ['.gltf', '.glb']
    const allowedExtensions = [...imageExtensions, ...gltfExtensions]
    
    if (!allowedExtensions.includes(fileExtension)) {
      return c.json({ 
        error: 'Only image files (.jpg, .jpeg, .png) and glTF files (.gltf, .glb) are allowed' 
      }, 400)
    }
    
    // Additional validation for image files
    if (imageExtensions.includes(fileExtension)) {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (file.type && !allowedImageTypes.includes(file.type)) {
        return c.json({ 
          error: 'Invalid image file type. Only JPG, JPEG, and PNG images are supported.' 
        }, 400)
      }
      
      // Check image file size (1MB limit)
      const maxImageSize = 1024 * 1024 // 1MB
      if (file.size > maxImageSize) {
        return c.json({ 
          error: `Image file too large. Maximum size is 1MB, but file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` 
        }, 400)
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}${fileExtension}`
    const filepath = path.join(uploadsDir, filename)

    // Save file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(filepath, buffer)

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const fileUrl = `${backendUrl}/uploads/${filename}`
    
    return c.json({ 
      filename,
      url: fileUrl,
      originalName: file.name,
      size: file.size,
      message: 'File uploaded successfully' 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

// Serve uploaded files
uploadRoutes.get('/:filename', async (c) => {
  try {
    const filename = c.req.param('filename')
    const filepath = path.join(uploadsDir, filename)
    
    try {
      await fs.access(filepath)
    } catch {
      return c.json({ error: 'File not found' }, 404)
    }

    const file = await fs.readFile(filepath)
    const ext = path.extname(filename).toLowerCase()
    
    let contentType = 'application/octet-stream'
    if (ext === '.gltf') {
      contentType = 'model/gltf+json'
    } else if (ext === '.glb') {
      contentType = 'model/gltf-binary'
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg'
    } else if (ext === '.png') {
      contentType = 'image/png'
    }

    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': file.length.toString(),
      },
    })
  } catch (error) {
    console.error('Serve file error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
