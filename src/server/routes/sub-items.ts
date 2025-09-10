import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/db'
import { authMiddleware } from '../lib/auth'

export const subItemRoutes = new Hono()

const createSubItemSchema = z.object({
  itemId: z.number(),
  title: z.string().min(1),
  gltfFile: z.string().min(1),
})

const updateSubItemSchema = z.object({
  title: z.string().min(1).optional(),
  gltfFile: z.string().min(1).optional(),
})

// Get sub-items for an item
subItemRoutes.get('/item/:itemId', async (c) => {
  try {
    const itemId = parseInt(c.req.param('itemId'))

    const subItems = await prisma.subItem.findMany({
      where: { itemId },
      orderBy: { id: 'desc' }
    })

    return c.json({ subItems })
  } catch (error) {
    console.error('Get sub-items error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single sub-item
subItemRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    const subItem = await prisma.subItem.findUnique({
      where: { id },
      include: {
        item: {
          select: { id: true, title: true, userId: true }
        }
      }
    })

    if (!subItem) {
      return c.json({ error: 'Sub-item not found' }, 404)
    }

    return c.json({ subItem })
  } catch (error) {
    console.error('Get sub-item error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new sub-item (protected)
subItemRoutes.post('/', authMiddleware, zValidator('json', createSubItemSchema), async (c) => {
  try {
    const { itemId, title, gltfFile } = c.req.valid('json')
    const user = c.get('user')

    // Check if parent item exists and belongs to user
    const parentItem = await prisma.item.findFirst({
      where: { id: itemId, userId: user.id }
    })

    if (!parentItem) {
      return c.json({ error: 'Parent item not found or unauthorized' }, 404)
    }

    const subItem = await prisma.subItem.create({
      data: {
        itemId,
        title,
        gltfFile,
      },
      include: {
        item: {
          select: { id: true, title: true }
        }
      }
    })

    return c.json({ subItem, message: 'Sub-item created successfully' })
  } catch (error) {
    console.error('Create sub-item error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update sub-item (protected)
subItemRoutes.put('/:id', authMiddleware, zValidator('json', updateSubItemSchema), async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const updates = c.req.valid('json')
    const user = c.get('user')

    // Check if sub-item exists and parent item belongs to user
    const existingSubItem = await prisma.subItem.findUnique({
      where: { id },
      include: {
        item: { select: { userId: true } }
      }
    })

    if (!existingSubItem || existingSubItem.item.userId !== user.id) {
      return c.json({ error: 'Sub-item not found or unauthorized' }, 404)
    }

    const subItem = await prisma.subItem.update({
      where: { id },
      data: updates,
      include: {
        item: {
          select: { id: true, title: true }
        }
      }
    })

    return c.json({ subItem, message: 'Sub-item updated successfully' })
  } catch (error) {
    console.error('Update sub-item error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete sub-item (protected)
subItemRoutes.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const user = c.get('user')

    // Check if sub-item exists and parent item belongs to user
    const existingSubItem = await prisma.subItem.findUnique({
      where: { id },
      include: {
        item: { select: { userId: true } }
      }
    })

    if (!existingSubItem || existingSubItem.item.userId !== user.id) {
      return c.json({ error: 'Sub-item not found or unauthorized' }, 404)
    }

    await prisma.subItem.delete({
      where: { id }
    })

    // TODO: Delete associated glTF file from filesystem
    // This would be implemented based on your file storage strategy

    return c.json({ message: 'Sub-item deleted successfully' })
  } catch (error) {
    console.error('Delete sub-item error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
