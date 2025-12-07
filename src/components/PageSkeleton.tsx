import { Skeleton } from "@/components/ui/skeleton";
import ProductGridSkeleton from "./ProductGridSkeleton";

interface PageSkeletonProps {
  type?: 'home' | 'products' | 'category' | 'search';
  showFilters?: boolean;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({ 
  type = 'products',
  showFilters = false 
}) => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section (for home) */}
      {type === 'home' && (
        <div className="space-y-4">
          <Skeleton className="h-64 md:h-96 w-full rounded-lg" />
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      )}

      {/* Product Grid */}
      <ProductGridSkeleton count={12} columns={4} />

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-md" />
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;

