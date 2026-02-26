interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function PRDCardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-border p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-4 w-full mb-2 rounded" />
      <Skeleton className="h-4 w-2/3 mb-4 rounded" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function UICardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-border overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <Skeleton className="h-4 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-2/3 mb-3 rounded" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function AINewsCardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-border p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-4 w-full mb-2 rounded" />
      <Skeleton className="h-4 w-2/3 mb-4 rounded" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 6, type = 'prd' }: { count?: number; type?: 'prd' | 'ui' }) {
  const CardComponent = type === 'prd' ? PRDCardSkeleton : UICardSkeleton;
  const gridClass = type === 'prd' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <CardComponent key={index} />
      ))}
    </div>
  );
}
