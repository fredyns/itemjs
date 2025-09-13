# 08 - Building a CRUD App: Step-by-Step Guide

## 🎯 Learning Goals
- Build a complete CRUD application from scratch
- Learn React patterns through hands-on practice
- Understand the full development workflow
- Apply concepts from previous tutorials

## 🚀 Project Overview

We'll build a **Task Manager** app that demonstrates all CRUD operations:
- **Create**: Add new tasks
- **Read**: List and view tasks
- **Update**: Edit existing tasks
- **Delete**: Remove tasks

### Final App Features:
- Task list with search and filtering
- Add/Edit task modal
- Task categories and priorities
- Local storage persistence
- Responsive design

## 📋 Step 1: Project Setup

### Create New React Project
```bash
# In your terminal
cd C:\Users\121925\CascadeProjects\learn-bhvr
npx create-react-app task-manager --template typescript
cd task-manager
npm install
```

### Install Additional Dependencies
```bash
npm install @tanstack/react-query lucide-react clsx
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configure Tailwind CSS
Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 📝 Step 2: Define Data Types

Create `src/types/Task.ts`:
```typescript
export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskFormData {
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
}
```

## 🗄️ Step 3: Create Storage Service

Create `src/services/taskService.ts`:
```typescript
import { Task, TaskFormData } from '../types/Task'

class TaskService {
  private storageKey = 'tasks'

  // Get all tasks
  getTasks(): Task[] {
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : []
  }

  // Get task by ID
  getTask(id: string): Task | undefined {
    const tasks = this.getTasks()
    return tasks.find(task => task.id === id)
  }

  // Create new task
  createTask(data: TaskFormData): Task {
    const tasks = this.getTasks()
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...data,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    tasks.push(newTask)
    this.saveTasks(tasks)
    return newTask
  }

  // Update existing task
  updateTask(id: string, data: Partial<TaskFormData>): Task | null {
    const tasks = this.getTasks()
    const index = tasks.findIndex(task => task.id === id)
    
    if (index === -1) return null
    
    tasks[index] = {
      ...tasks[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    this.saveTasks(tasks)
    return tasks[index]
  }

  // Toggle task completion
  toggleTask(id: string): Task | null {
    const tasks = this.getTasks()
    const index = tasks.findIndex(task => task.id === id)
    
    if (index === -1) return null
    
    tasks[index].completed = !tasks[index].completed
    tasks[index].updatedAt = new Date().toISOString()
    
    this.saveTasks(tasks)
    return tasks[index]
  }

  // Delete task
  deleteTask(id: string): boolean {
    const tasks = this.getTasks()
    const filteredTasks = tasks.filter(task => task.id !== id)
    
    if (filteredTasks.length === tasks.length) return false
    
    this.saveTasks(filteredTasks)
    return true
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks))
  }
}

export const taskService = new TaskService()
```

## 🎨 Step 4: Create UI Components

### Basic Button Component
Create `src/components/ui/Button.tsx`:
```typescript
import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
        },
        {
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Input Component
Create `src/components/ui/Input.tsx`:
```typescript
import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'block w-full rounded-md border-gray-300 shadow-sm',
          'focus:border-blue-500 focus:ring-blue-500',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
```

## 📋 Step 5: Build Task List Component

Create `src/components/TaskList.tsx`:
```typescript
import React, { useState } from 'react'
import { Task, TaskCategory, TaskPriority } from '../types/Task'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Trash2, Edit, Check, X } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggle
}) => {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'pending'>('all')

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                         task.description.toLowerCase().includes(search.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory
    
    const matchesCompleted = filterCompleted === 'all' ||
                            (filterCompleted === 'completed' && task.completed) ||
                            (filterCompleted === 'pending' && !task.completed)
    
    return matchesSearch && matchesCategory && matchesCompleted
  })

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
    }
  }

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800'
      case 'personal': return 'bg-purple-100 text-purple-800'
      case 'shopping': return 'bg-orange-100 text-orange-800'
      case 'health': return 'bg-pink-100 text-pink-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="shopping">Shopping</option>
          <option value="health">Health</option>
        </select>
        
        <select
          value={filterCompleted}
          onChange={(e) => setFilterCompleted(e.target.value as 'all' | 'completed' | 'pending')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 border rounded-lg ${task.completed ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                  </div>
                  <p className={`text-sm text-gray-600 ${task.completed ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onToggle(task.id)}
                  >
                    {task.completed ? <X size={16} /> : <Check size={16} />}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(task)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

## 📝 Step 6: Create Task Form Modal

Create `src/components/TaskModal.tsx`:
```typescript
import React, { useState, useEffect } from 'react'
import { Task, TaskFormData, TaskCategory, TaskPriority } from '../types/Task'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X } from 'lucide-react'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TaskFormData) => void
  task?: Task | null
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium'
  })

  const [errors, setErrors] = useState<Partial<TaskFormData>>({})

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority
        })
      } else {
        setFormData({
          title: '',
          description: '',
          category: 'personal',
          priority: 'medium'
        })
      }
      setErrors({})
    }
  }, [isOpen, task])

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <Button variant="secondary" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="Enter task title"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Enter task description"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Add Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

## 🏠 Step 7: Create Main App Component

Update `src/App.tsx`:
```typescript
import React, { useState, useEffect } from 'react'
import { Task, TaskFormData } from './types/Task'
import { taskService } from './services/taskService'
import { TaskList } from './components/TaskList'
import { TaskModal } from './components/TaskModal'
import { Button } from './components/ui/Button'
import { Plus } from 'lucide-react'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Load tasks on component mount
  useEffect(() => {
    const loadedTasks = taskService.getTasks()
    setTasks(loadedTasks)
  }, [])

  const handleAddTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleSaveTask = (data: TaskFormData) => {
    if (editingTask) {
      // Update existing task
      const updatedTask = taskService.updateTask(editingTask.id, data)
      if (updatedTask) {
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ))
      }
    } else {
      // Create new task
      const newTask = taskService.createTask(data)
      setTasks(prev => [...prev, newTask])
    }
  }

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const success = taskService.deleteTask(id)
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== id))
      }
    }
  }

  const handleToggleTask = (id: string) => {
    const updatedTask = taskService.toggleTask(id)
    if (updatedTask) {
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ))
    }
  }

  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
            <Button onClick={handleAddTask}>
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <TaskList
          tasks={tasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggle={handleToggleTask}
        />

        {/* Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          task={editingTask}
        />
      </div>
    </div>
  )
}

export default App
```

## 🚀 Step 8: Run Your App

```bash
npm start
```

Your CRUD app is now complete! 

## 🎯 Key Learning Points

1. **State Management**: Using `useState` for local component state
2. **Effect Management**: Using `useEffect` for data loading
3. **Event Handling**: Form submissions, button clicks, input changes
4. **Conditional Rendering**: Showing/hiding modals, empty states
5. **Component Communication**: Props and callbacks between components
6. **Form Validation**: Client-side validation with error states
7. **Local Storage**: Persisting data without a backend

## 🏃‍♂️ Next Challenges

1. Add drag-and-drop task reordering
2. Implement task due dates
3. Add task categories with colors
4. Create task search with highlighting
5. Add export/import functionality

## 💡 Laravel Developer Notes

- **React state** = Laravel session data
- **Component props** = Blade component parameters
- **useEffect** = Laravel lifecycle hooks
- **Event handlers** = Laravel form requests
- **Local storage** = Laravel cache/session storage

This CRUD app demonstrates all the core React patterns you'll use in real applications!
