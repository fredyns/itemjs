import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/db'
import { authMiddleware } from '../lib/auth'
import { generateUniqueSlug } from '../lib/utils'

export const itemRoutes = new Hono()

const createItemSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  gltfFile: z.string().optional(),
  image: z.string().optional(),
})

const updateItemSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  gltfFile: z.string().optional(),
  image: z.string().optional(),
})

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
})

// Get all items with pagination and search
itemRoutes.get('/', zValidator('query', querySchema), async (c) => {
  try {
    const { page, limit, search } = c.req.valid('query')
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true }
          },
          _count: {
            select: { subItems: true }
          }
        },
        orderBy: { postedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.item.count({ where })
    ])

    return c.json({
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Get items error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single item by ID or slug
itemRoutes.get('/:identifier', async (c) => {
  try {
    const identifier = c.req.param('identifier')
    const isNumeric = /^\d+$/.test(identifier)
    
    const item = await prisma.item.findFirst({
      where: isNumeric 
        ? { id: parseInt(identifier) }
        : { slug: identifier },
      include: {
        user: {
          select: { id: true, email: true }
        },
        subItems: {
          orderBy: { id: 'desc' }
        }
      }
    })

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Increment view count
    await prisma.item.update({
      where: { id: item.id },
      data: { viewCounts: { increment: 1 } }
    })

    return c.json({ item: { ...item, viewCounts: item.viewCounts + 1 } })
  } catch (error) {
    console.error('Get item error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new item (protected)
itemRoutes.post('/', authMiddleware, zValidator('json', createItemSchema), async (c) => {
  try {
    const { title, content, gltfFile, image } = c.req.valid('json')
    const user = c.get('user')

    // Generate unique slug
    const slug = await generateUniqueSlug(title, async (slug) => {
      const existing = await prisma.item.findUnique({ where: { slug } })
      return !!existing
    })

    const item = await prisma.item.create({
      data: {
        title,
        slug,
        content,
        gltfFile,
        image,
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, email: true }
        },
        _count: {
          select: { subItems: true }
        }
      }
    })

    return c.json({ item, message: 'Item created successfully' })
  } catch (error) {
    console.error('Create item error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update item (protected)
itemRoutes.put('/:id', authMiddleware, zValidator('json', updateItemSchema), async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const updates = c.req.valid('json')
    const user = c.get('user')

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingItem) {
      return c.json({ error: 'Item not found or unauthorized' }, 404)
    }

    // Generate new slug if title is being updated
    let slug = existingItem.slug
    if (updates.title && updates.title !== existingItem.title) {
      slug = await generateUniqueSlug(updates.title, async (slug) => {
        const existing = await prisma.item.findFirst({ 
          where: { slug, id: { not: id } } 
        })
        return !!existing
      })
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...updates,
        slug,
      },
      include: {
        user: {
          select: { id: true, email: true }
        },
        subItems: {
          orderBy: { id: 'desc' }
        }
      }
    })

    return c.json({ item, message: 'Item updated successfully' })
  } catch (error) {
    console.error('Update item error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete item (protected)
itemRoutes.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const user = c.get('user')

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findFirst({
      where: { id, userId: user.id },
      include: { subItems: true }
    })

    if (!existingItem) {
      return c.json({ error: 'Item not found or unauthorized' }, 404)
    }

    // Delete item (cascade will handle sub-items)
    await prisma.item.delete({
      where: { id }
    })

    // TODO: Delete associated files from filesystem
    // This would be implemented based on your file storage strategy

    return c.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Delete item error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
