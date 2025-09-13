import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Specific skeleton components for different use cases
export const ItemCardSkeleton: React.FC = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <Skeleton className="h-20 w-20 rounded" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  </div>
)

export const ItemsGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ItemCardSkeleton key={i} />
    ))}
  </div>
)

export const ThreeViewerSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("relative bg-gray-100 rounded-lg", className)}>
    <Skeleton className="w-full h-full" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
)

export const ItemDetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <Skeleton className="h-64 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

export { Skeleton }
