# 11 - Full-Stack CRUD App: Bringing It All Together

## 🎯 Project Overview
Build a complete **Task Management System** that combines all concepts from previous tutorials. This project will mirror your ItemJS architecture but focus on task management to reinforce learning.

## 📂 Reference Your ItemJS Architecture
Study these files from your actual project:
- **[src/lib/api.ts](../src/lib/api.ts)** - API client patterns
- **[src/server/index.ts](../src/server/index.ts)** - Backend implementation
- **[prisma/schema.prisma](../prisma/schema.prisma)** - Database schema
- **[src/pages/ItemsIndex.tsx](../src/pages/ItemsIndex.tsx)** - List page patterns
- **[src/pages/ShowItem.tsx](../src/pages/ShowItem.tsx)** - Detail page patterns

## 🏗️ Project Architecture

### Database Schema (Prisma)
```prisma
// prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  status      Status   @default(PENDING)
  priority    Priority @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  tags        Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  color String @default("#3B82F6")
  tasks Task[]
}

enum Status {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Backend API (Bun + Hono)
```typescript
// src/server/index.ts
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const app = new Hono()
const prisma = new PrismaClient()

// Tasks CRUD
app.get('/api/tasks', async (c) => {
  const { page = 1, limit = 10, status, priority } = c.req.query()
  
  const tasks = await prisma.task.findMany({
    where: {
      ...(status && { status: status as Status }),
      ...(priority && { priority: priority as Priority })
    },
    include: { user: true, tags: true },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  })
  
  const total = await prisma.task.count()
  
  return c.json({
    tasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  })
})

app.post('/api/tasks', async (c) => {
  const { title, description, priority, dueDate, tagIds } = await c.req.json()
  
  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: 1, // Get from auth
      tags: {
        connect: tagIds?.map((id: number) => ({ id })) || []
      }
    },
    include: { user: true, tags: true }
  })
  
  return c.json({ task, message: 'Task created successfully' })
})
```

### Frontend Components

#### 1. Task List Page
```typescript
// src/pages/TasksIndex.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '../lib/api'

export const TasksIndex = () => {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', { page, ...filters }],
    queryFn: () => tasksApi.getAll({ page, ...filters })
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Task
        </button>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      {/* Task List */}
      {isLoading ? (
        <TaskListSkeleton />
      ) : (
        <TaskList tasks={data?.tasks || []} />
      )}

      {/* Pagination */}
      <Pagination 
        currentPage={page}
        totalPages={data?.pagination.pages || 1}
        onPageChange={setPage}
      />
    </div>
  )
}
```

#### 2. Task Card Component
```typescript
// src/components/TaskCard.tsx
interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: number, status: Status) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const priorityColors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    PENDING: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}

      {task.dueDate && (
        <p className="text-sm text-gray-500 mb-4">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map(tag => (
            <span
              key={tag.id}
              className="px-2 py-1 rounded text-xs"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### 3. Task Form Modal
```typescript
// src/components/TaskFormModal.tsx
interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task
  onSubmit: (data: TaskFormData) => void
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmit
}) => {
  const form = useForm({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate || '',
    tagIds: task?.tags.map(t => t.id) || []
  })

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.validate()) {
      onSubmit(form.values)
      onClose()
      form.reset()
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={form.values.title}
            onChange={(e) => form.setValue('title', e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          {form.errors.title && (
            <p className="text-red-500 text-sm mt-1">{form.errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.values.description}
            onChange={(e) => form.setValue('description', e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={form.values.priority}
              onChange={(e) => form.setValue('priority', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={form.values.dueDate}
              onChange={(e) => form.setValue('dueDate', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <TagSelector
            availableTags={tags || []}
            selectedTagIds={form.values.tagIds}
            onSelectionChange={(tagIds) => form.setValue('tagIds', tagIds)}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {task ? 'Update' : 'Create'} Task
          </button>
        </div>
      </form>
    </Modal>
  )
}
```

## 🚀 Implementation Steps

### Phase 1: Setup (Follow your ItemJS patterns)
1. Initialize Prisma with the schema above
2. Set up Bun + Hono backend server
3. Create React app with TypeScript
4. Configure React Query and routing

### Phase 2: Core Features
1. **Task CRUD Operations**
   - Create, read, update, delete tasks
   - Status and priority management
   - Due date handling

2. **Filtering and Search**
   - Filter by status, priority, tags
   - Search by title and description
   - Pagination

3. **Tag Management**
   - Create and manage tags
   - Assign multiple tags to tasks
   - Color-coded tag system

### Phase 3: Advanced Features
1. **Dashboard with Analytics**
   - Task completion statistics
   - Priority distribution charts
   - Overdue task alerts

2. **User Management**
   - Authentication system
   - User profiles
   - Task assignment

3. **Real-time Updates**
   - WebSocket integration
   - Live task status updates
   - Collaborative features

## 🎯 Learning Objectives Achieved

By completing this project, you will have:

✅ **Full-Stack Architecture** - Complete app from database to UI
✅ **Prisma ORM Mastery** - Complex relationships and queries  
✅ **React Patterns** - All patterns from previous tutorials
✅ **TypeScript Integration** - End-to-end type safety
✅ **API Design** - RESTful API with proper error handling
✅ **State Management** - React Query for server state
✅ **Performance Optimization** - Memoization and lazy loading
✅ **Real-World Patterns** - Following your ItemJS architecture

## 🚀 Next Steps

After completing this project:
1. **Deploy** using your Docker setup from tutorial 12
2. **Add Testing** - Unit and integration tests
3. **Enhance UI** - Advanced animations and interactions
4. **Scale Features** - Add more complex business logic
5. **Optimize Performance** - Bundle analysis and optimization

## 💡 Success Metrics

Your project is successful when:
- All CRUD operations work smoothly
- Real-time updates function properly
- Performance is optimized (no unnecessary re-renders)
- Code follows TypeScript best practices
- UI is responsive and accessible
- Error handling is comprehensive
- Code is well-documented and maintainable

This capstone project brings together everything you've learned and demonstrates your mastery of modern React development patterns!
