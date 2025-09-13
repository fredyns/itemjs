# 14 - Shadcn/ui: Modern Component Library & Design System

## 🎯 Learning Goals
- Master Shadcn/ui for building consistent, accessible UI components
- Understand design systems and component composition
- Learn Tailwind CSS integration and customization
- Apply modern UI patterns from your ItemJS project
- Compare with Laravel Blade components and UI frameworks

## 📚 What is Shadcn/ui?

**Shadcn/ui** is a modern component library built on **Radix UI** primitives and styled with **Tailwind CSS**. Unlike traditional component libraries, you copy and own the components, giving you full control.

### 🔄 **Laravel vs Shadcn/ui Comparison**

| Laravel Concept | Shadcn/ui Equivalent | Purpose |
|----------------|----------------------|---------|
| Blade Components | Shadcn Components | Reusable UI elements |
| `@component` | `<Button variant="...">` | Component variants |
| Blade Slots | Component composition | Content injection |
| CSS Frameworks | Tailwind + Radix | Styling system |
| Form Requests | Zod + React Hook Form | Form validation |
| Blade Directives | Conditional rendering | Template logic |

## 🏗️ **Setup and Installation**

### **1. Initialize Shadcn/ui in Your Project**
```bash
# Install shadcn/ui CLI
npx shadcn-ui@latest init

# Configure your project
✔ Would you like to use TypeScript (recommended)? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … src/index.css
✔ Would you like to use CSS variables for colors? … yes
✔ Where is your tailwind.config.js located? … tailwind.config.js
✔ Configure the import alias for components? … src/components
✔ Configure the import alias for utils? … src/lib/utils
```

### **2. Project Structure**
```
src/
├── components/
│   └── ui/           # Shadcn components
│       ├── button.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       └── ...
├── lib/
│   └── utils.ts      # Utility functions
└── styles/
    └── globals.css   # Global styles
```

## 🧩 **Core Components**

### **1. Button Component**
```typescript
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Laravel Blade Equivalent:**
```php
{{-- resources/views/components/button.blade.php --}}
@props([
    'variant' => 'default',
    'size' => 'default',
    'type' => 'button'
])

@php
$classes = match($variant) {
    'primary' => 'bg-blue-500 text-white hover:bg-blue-600',
    'secondary' => 'bg-gray-500 text-white hover:bg-gray-600',
    'outline' => 'border border-gray-300 hover:bg-gray-50',
    default => 'bg-blue-500 text-white hover:bg-blue-600'
};

$sizes = match($size) {
    'sm' => 'px-3 py-1 text-sm',
    'lg' => 'px-6 py-3 text-lg',
    default => 'px-4 py-2'
};
@endphp

<button 
    type="{{ $type }}"
    {{ $attributes->merge(['class' => "inline-flex items-center justify-center rounded-md font-medium transition-colors $classes $sizes"]) }}
>
    {{ $slot }}
</button>

{{-- Usage --}}
<x-button variant="primary" size="lg">Save Changes</x-button>
```

### **2. Form Components**

#### **Input Component**
```typescript
// src/components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

#### **Form with Validation**
```typescript
// src/components/ui/form.tsx - Using React Hook Form + Zod
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
})

type FormData = z.infer<typeof formSchema>

export function TaskForm({ onSubmit, defaultValues }: TaskFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...form.register("title")}
          className={form.formState.errors.title ? "border-red-500" : ""}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...form.register("description")}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Task"}
      </Button>
    </form>
  )
}
```

**Laravel Form Request Equivalent:**
```php
<?php
// app/Http/Requests/TaskRequest.php
class TaskRequest extends FormRequest
{
    public function rules()
    {
        return [
            'title' => 'required|string|max:100',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
        ];
    }
}

// resources/views/tasks/form.blade.php
<form method="POST" action="{{ route('tasks.store') }}">
    @csrf
    
    <div class="space-y-2">
        <label for="title" class="block text-sm font-medium">Title</label>
        <input 
            type="text" 
            id="title" 
            name="title" 
            value="{{ old('title', $task->title ?? '') }}"
            class="w-full rounded-md border px-3 py-2 @error('title') border-red-500 @enderror"
        >
        @error('title')
            <p class="text-sm text-red-500">{{ $message }}</p>
        @enderror
    </div>
    
    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md">
        Save Task
    </button>
</form>
```

### **3. Modal/Dialog Component**
```typescript
// src/components/ui/dialog.tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))

// Usage Example
export function CreateTaskDialog() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <TaskForm onSubmit={(data) => {
          // Handle form submission
          console.log(data)
          setOpen(false)
        }} />
      </DialogContent>
    </Dialog>
  )
}
```

## 🎨 **Design System & Theming**

### **1. CSS Variables for Theming**
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark theme variables */
  }
}
```

### **2. Tailwind Configuration**
```javascript
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme")

module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... more color definitions
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## 🔧 **Advanced Components**

### **1. Data Table Component**
```typescript
// src/components/ui/data-table.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { useState } from "react"
import { Button } from "./button"
import { ArrowUpDown } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="h-12 px-4 text-left align-middle">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                No results.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// Column definitions
export const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "completed" ? "success" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
]
```

### **2. Toast Notifications**
```typescript
// src/components/ui/toast.tsx
import { useToast } from "@/hooks/use-toast"
import { Button } from "./button"

export function ToastDemo() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled: Catch up",
          description: "Friday, February 10, 2023 at 5:57 PM",
          action: (
            <Button variant="outline" size="sm">
              Undo
            </Button>
          ),
        })
      }}
    >
      Show Toast
    </Button>
  )
}

// Usage in your app
const createTaskMutation = useMutation({
  mutationFn: tasksApi.create,
  onSuccess: () => {
    toast({
      title: "Success!",
      description: "Task created successfully.",
      variant: "success",
    })
  },
  onError: () => {
    toast({
      title: "Error",
      description: "Failed to create task.",
      variant: "destructive",
    })
  },
})
```

## 🚀 **Integration with Your ItemJS Project**

### **1. Replacing Existing Components**
```typescript
// Before: Custom button
<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  Save Item
</button>

// After: Shadcn Button
<Button variant="default" size="default">
  Save Item
</Button>

// Before: Custom modal
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div className="bg-white p-6 rounded-lg">
    {/* Modal content */}
  </div>
</div>

// After: Shadcn Dialog
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    {/* Modal content */}
  </DialogContent>
</Dialog>
```

### **2. Form Integration**
```typescript
// Enhanced ItemJS form with Shadcn components
export function ItemForm({ item, onSubmit }: ItemFormProps) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      category: item?.category || "",
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...form.register("title")}
          placeholder="Enter item title..."
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(value) => form.setValue("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="books">Books</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Item"}
        </Button>
      </div>
    </form>
  )
}
```

## 🎯 **Best Practices**

### **1. Component Composition**
```typescript
// Good: Composable components
<Card>
  <CardHeader>
    <CardTitle>Item Details</CardTitle>
    <CardDescription>View and edit item information</CardDescription>
  </CardHeader>
  <CardContent>
    <ItemForm item={item} />
  </CardContent>
  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>

// Avoid: Monolithic components
<ItemCard 
  title="Item Details"
  description="View and edit item information"
  showForm={true}
  showButtons={true}
  item={item}
/>
```

### **2. Consistent Spacing**
```typescript
// Use consistent spacing classes
<div className="space-y-4">  {/* Vertical spacing */}
  <div className="flex space-x-2">  {/* Horizontal spacing */}
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </div>
</div>
```

### **3. Accessibility**
```typescript
// Always include proper labels and ARIA attributes
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    aria-describedby="email-error"
  />
  {error && (
    <p id="email-error" className="text-sm text-destructive">
      {error.message}
    </p>
  )}
</div>
```

## 🎓 **Key Takeaways**

### **Shadcn/ui vs Laravel Blade:**

1. **Component Ownership**: You own the code vs framework dependency
2. **Customization**: Full control vs limited theming options
3. **Type Safety**: TypeScript integration vs runtime errors
4. **Accessibility**: Built-in ARIA support vs manual implementation
5. **Design System**: Consistent tokens vs custom CSS

### **When to Use Shadcn/ui:**
- ✅ Building design systems
- ✅ Need full component control
- ✅ TypeScript projects
- ✅ Accessibility requirements
- ✅ Consistent UI patterns

### **Migration Strategy:**
1. **Start with new components** - Use Shadcn for new features
2. **Replace incrementally** - Update existing components gradually
3. **Maintain consistency** - Use design tokens throughout
4. **Test thoroughly** - Ensure accessibility and functionality

## 🚀 **Next Steps**

After mastering Shadcn/ui:
1. **Build your design system** - Create consistent component library
2. **Add dark mode support** - Implement theme switching
3. **Create custom variants** - Extend components for your needs
4. **Integrate with forms** - Combine with React Hook Form
5. **Add animations** - Enhance with Framer Motion

**Next Tutorial**: `15-threejs-integration.md` - Learn 3D graphics and WebGL integration.

Shadcn/ui provides the perfect balance of control, consistency, and developer experience for modern React applications!
