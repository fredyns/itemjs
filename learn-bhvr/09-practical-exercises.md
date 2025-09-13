# 09 - Practical Exercises: Hands-On React Challenges

## 🎯 Learning Goals
- Apply all concepts learned in previous tutorials
- Build real-world features using your ItemJS codebase as reference
- Practice debugging and problem-solving
- Reinforce React patterns through hands-on coding
- Challenge yourself with progressively complex exercises

## 📚 Prerequisites
Before starting these exercises, make sure you've completed:
- **01-javascript-basics.md** - JavaScript fundamentals
- **02-react-fundamentals.md** - React core concepts
- **03-component-architecture.md** - Component design patterns
- **04-state-management.md** - State management with React Query
- **05-api-integration.md** - API client patterns
- **06-typescript-basics.md** - TypeScript fundamentals
- **07-advanced-patterns.md** - Custom hooks and performance

## 🏃‍♂️ Exercise Categories

### 🟢 **Beginner Exercises** (Complete 3-4)
- Focus on basic React concepts
- Simple component creation
- Basic state management
- Props and event handling

### 🟡 **Intermediate Exercises** (Complete 2-3)
- API integration
- Form handling and validation
- Custom hooks
- Performance optimization

### 🔴 **Advanced Exercises** (Complete 1-2)
- Complex state management
- Advanced patterns
- Full-feature implementation
- Testing and optimization

---

## 🟢 Beginner Exercises

### Exercise 1: User Profile Card Component
**Difficulty: ⭐⭐☆☆☆**

Create a reusable user profile card component similar to how users are displayed in your ItemJS app.

**Requirements:**
```typescript
interface User {
  id: number
  email: string
  name?: string
  avatar?: string
  joinedAt: string
  itemsCount: number
}

interface UserProfileCardProps {
  user: User
  showActions?: boolean
  onEdit?: (user: User) => void
  onDelete?: (userId: number) => void
}
```

**Your Task:**
1. Create a `UserProfileCard` component with proper TypeScript typing
2. Display user information with fallbacks for missing data
3. Add conditional action buttons (Edit/Delete)
4. Style with Tailwind CSS (like your ItemJS components)
5. Handle loading and error states

**Expected Output:**
```tsx
const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  showActions = false,
  onEdit,
  onDelete
}) => {
  // Your implementation here
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      {/* User avatar, name, email, stats */}
      {/* Conditional action buttons */}
    </div>
  )
}
```

**Bonus Points:**
- Add hover effects and animations
- Include a skeleton loading state
- Add proper accessibility attributes

---

### Exercise 2: Search and Filter Component
**Difficulty: ⭐⭐☆☆☆**

Build a search and filter component inspired by your ItemsIndex search functionality.

**Requirements:**
```typescript
interface FilterOption {
  value: string
  label: string
  count?: number
}

interface SearchFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters: {
    category: FilterOption[]
    status: FilterOption[]
  }
  selectedFilters: {
    category: string
    status: string
  }
  onFilterChange: (filterType: string, value: string) => void
  onClear: () => void
}
```

**Your Task:**
1. Create a search input with debounced onChange
2. Add dropdown filters for category and status
3. Display active filter count
4. Add a "Clear All" button
5. Show filter counts next to options

**Expected Features:**
- Real-time search with 300ms debounce
- Multi-select dropdown filters
- Visual indication of active filters
- Responsive design for mobile

---

### Exercise 3: Modal Management System
**Difficulty: ⭐⭐⭐☆☆**

Create a modal system similar to your ItemJS modals (AddSubItemModal, UpdateItemModal).

**Requirements:**
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}
```

**Your Task:**
1. Create a base `Modal` component with portal rendering
2. Add backdrop click and ESC key to close
3. Implement different sizes
4. Add smooth open/close animations
5. Create a `useModal` custom hook

**Expected Implementation:**
```tsx
// Base Modal component
const Modal: React.FC<ModalProps> = ({ ... }) => {
  // Portal rendering to document.body
  // Backdrop and ESC handling
  // Animation with framer-motion or CSS transitions
}

// Custom hook
const useModal = (initialOpen = false) => {
  // Modal state management
  // Return { isOpen, open, close, toggle }
}

// Usage example
const MyComponent = () => {
  const modal = useModal()
  
  return (
    <>
      <button onClick={modal.open}>Open Modal</button>
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Example">
        <p>Modal content here</p>
      </Modal>
    </>
  )
}
```

---

### Exercise 4: Data Table with Sorting
**Difficulty: ⭐⭐⭐☆☆**

Build a reusable data table component for displaying your items data.

**Requirements:**
```typescript
interface Column<T> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: T[keyof T], item: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  onRowClick?: (item: T) => void
  sortBy?: keyof T
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
}
```

**Your Task:**
1. Create a generic data table component
2. Implement column sorting with visual indicators
3. Add loading skeleton rows
4. Handle empty state
5. Make rows clickable with hover effects

**Expected Features:**
- Click column headers to sort
- Visual sort indicators (arrows)
- Responsive design with horizontal scroll
- Loading skeleton animation
- Empty state with helpful message

---

## 🟡 Intermediate Exercises

### Exercise 5: Form Builder with Validation
**Difficulty: ⭐⭐⭐⭐☆**

Create a dynamic form builder inspired by your ItemJS form patterns.

**Requirements:**
```typescript
interface FormField {
  name: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'file'
  label: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[] // for select
  validation?: (value: any) => string | undefined
}

interface FormBuilderProps {
  fields: FormField[]
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => void
  submitLabel?: string
  loading?: boolean
}
```

**Your Task:**
1. Build a dynamic form that renders based on field configuration
2. Implement real-time validation with error display
3. Handle different input types (text, select, file upload)
4. Add form state management with custom hook
5. Include submit handling with loading states

**Expected Features:**
- Real-time validation on blur/change
- File upload with preview (for images)
- Form reset functionality
- Accessible form labels and error messages
- Submit button disabled during validation errors

**Bonus Challenge:**
- Add drag-and-drop file upload
- Implement field dependencies (show/hide based on other fields)
- Add form auto-save to localStorage

---

### Exercise 6: Infinite Scroll List
**Difficulty: ⭐⭐⭐⭐☆**

Build an infinite scroll component for loading items, similar to extending your ItemsIndex.

**Requirements:**
```typescript
interface InfiniteScrollProps<T> {
  items: T[]
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  renderItem: (item: T, index: number) => React.ReactNode
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  threshold?: number // pixels from bottom to trigger load
}
```

**Your Task:**
1. Create an infinite scroll container with intersection observer
2. Implement smooth loading states
3. Handle error states and retry functionality
4. Add pull-to-refresh for mobile
5. Optimize performance with virtualization for large lists

**Expected Features:**
- Automatic loading when scrolling near bottom
- Loading spinner at the end of list
- Error handling with retry button
- Smooth animations for new items
- Mobile-friendly pull-to-refresh

---

### Exercise 7: Real-time Notification System
**Difficulty: ⭐⭐⭐⭐☆**

Create a toast notification system for your application.

**Requirements:**
```typescript
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}
```

**Your Task:**
1. Create a notification context and provider
2. Build toast components with different types and animations
3. Implement auto-dismiss with pause on hover
4. Add action buttons for interactive notifications
5. Create helper functions for common notification types

**Expected Features:**
- Slide-in animations from top-right
- Auto-dismiss after specified duration
- Pause timer on hover
- Stack multiple notifications
- Different icons and colors for each type
- Swipe to dismiss on mobile

---

## 🔴 Advanced Exercises

### Exercise 8: Advanced Search with Filters and Facets
**Difficulty: ⭐⭐⭐⭐⭐**

Build a comprehensive search system like a modern e-commerce site.

**Requirements:**
```typescript
interface SearchFacet {
  key: string
  label: string
  type: 'checkbox' | 'range' | 'select'
  options?: { value: string; label: string; count: number }[]
  range?: { min: number; max: number; step: number }
}

interface SearchState {
  query: string
  filters: Record<string, any>
  sort: { field: string; direction: 'asc' | 'desc' }
  page: number
}
```

**Your Task:**
1. Create a search interface with multiple filter types
2. Implement URL state synchronization (filters in URL)
3. Add search suggestions/autocomplete
4. Build faceted search with counts
5. Add search history and saved searches

**Expected Features:**
- Real-time search suggestions
- Filter by multiple criteria simultaneously
- URL reflects current search state
- Search result highlighting
- Advanced sorting options
- Export search results

---

### Exercise 9: Drag and Drop File Manager
**Difficulty: ⭐⭐⭐⭐⭐**

Create a file management interface similar to your ItemJS file upload system.

**Requirements:**
```typescript
interface FileItem {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress?: number
  status: 'uploading' | 'completed' | 'error'
}

interface FileManagerProps {
  files: FileItem[]
  onUpload: (files: File[]) => void
  onDelete: (fileId: string) => void
  onRename: (fileId: string, newName: string) => void
  acceptedTypes?: string[]
  maxFileSize?: number
  maxFiles?: number
}
```

**Your Task:**
1. Build drag-and-drop upload area with file validation
2. Implement upload progress tracking
3. Add file preview for images and documents
4. Create file organization (folders, tags)
5. Add batch operations (select multiple, bulk delete)

**Expected Features:**
- Drag and drop multiple files
- File type validation and size limits
- Upload progress bars
- Image thumbnails and document previews
- Bulk selection and operations
- File search and filtering
- Responsive grid/list view toggle

---

### Exercise 10: Real-time Collaborative Features
**Difficulty: ⭐⭐⭐⭐⭐**

Build real-time collaborative features using WebSockets.

**Requirements:**
```typescript
interface CollaborativeEditorProps {
  documentId: string
  initialContent: string
  onContentChange: (content: string) => void
  collaborators: User[]
}

interface RealtimeUpdate {
  type: 'content_change' | 'cursor_position' | 'user_joined' | 'user_left'
  userId: string
  data: any
  timestamp: number
}
```

**Your Task:**
1. Create a collaborative text editor with real-time updates
2. Show other users' cursors and selections
3. Implement conflict resolution for simultaneous edits
4. Add user presence indicators
5. Build activity feed for document changes

**Expected Features:**
- Real-time text synchronization
- Multiple user cursors with names
- Conflict-free collaborative editing
- User presence (online/offline status)
- Change history and undo/redo
- Comments and suggestions system

---

## 🧪 Debugging Challenges

### Challenge 1: Performance Issues
**Scenario:** Your ItemsList component is re-rendering too frequently and causing performance issues.

**Your Task:**
1. Identify the performance bottlenecks
2. Implement proper memoization
3. Optimize expensive calculations
4. Fix unnecessary re-renders

**Given Code (Problematic):**
```tsx
const ItemsList = ({ searchTerm, category }) => {
  const [items, setItems] = useState([])
  
  // This runs on every render!
  const filteredItems = items.filter(item => {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (category === 'all' || item.category === category)
  })
  
  // This creates a new function every render
  const handleItemClick = (itemId) => {
    console.log('Clicked item:', itemId)
    // Navigate to item
  }
  
  return (
    <div>
      {filteredItems.map(item => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onClick={handleItemClick}
        />
      ))}
    </div>
  )
}
```

**Fix the issues and explain your optimizations.**

---

### Challenge 2: Memory Leaks
**Scenario:** Your app has memory leaks causing it to slow down over time.

**Your Task:**
1. Identify potential memory leak sources
2. Fix event listener cleanup
3. Cancel pending API requests
4. Clean up timers and intervals

**Given Code (Problematic):**
```tsx
const LiveDataComponent = () => {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // Memory leak: interval not cleaned up
    setInterval(() => {
      fetch('/api/live-data')
        .then(res => res.json())
        .then(setData)
    }, 1000)
    
    // Memory leak: event listener not removed
    window.addEventListener('resize', handleResize)
  }, [])
  
  const handleResize = () => {
    // Handle resize
  }
  
  return <div>{JSON.stringify(data)}</div>
}
```

**Fix the memory leaks and explain the solutions.**

---

## 🎯 Exercise Solutions and Learning Path

### Recommended Completion Order:
1. **Start with Beginner** - Build confidence with basic concepts
2. **Progress to Intermediate** - Apply patterns from your ItemJS codebase
3. **Challenge with Advanced** - Push your limits with complex features
4. **Debug and Optimize** - Learn to identify and fix common issues

### Success Criteria:
- ✅ Code compiles without TypeScript errors
- ✅ Components are properly typed and reusable
- ✅ State management follows React best practices
- ✅ Performance is optimized (no unnecessary re-renders)
- ✅ Accessibility guidelines are followed
- ✅ Code is well-documented and tested

### Getting Help:
1. **Reference your ItemJS codebase** - Look at similar patterns
2. **Review previous tutorials** - Reinforce concepts
3. **Use TypeScript compiler** - Let it guide you to correct types
4. **Test incrementally** - Build and test small pieces
5. **Profile performance** - Use React DevTools

## 🚀 Next Steps

After completing these exercises, you'll have:
- **Hands-on experience** with all React concepts
- **Confidence** in building complex features
- **Problem-solving skills** for debugging issues
- **Performance optimization** knowledge
- **Real-world patterns** from practical application

**Next Tutorial**: `11-fullstack-prisma-app.md` - Combine everything you've learned to build a complete full-stack application.

## 💡 Pro Tips for Success

- **Start small** - Break complex exercises into smaller tasks
- **Reference your ItemJS code** - Use it as a guide for patterns
- **Test frequently** - Don't write too much code before testing
- **Use TypeScript** - Let the compiler catch errors early
- **Profile performance** - Measure before and after optimizations
- **Document your code** - Explain your design decisions
- **Seek feedback** - Review your solutions critically

Remember: The goal isn't just to complete the exercises, but to understand the underlying patterns and principles that make React applications maintainable and performant!
