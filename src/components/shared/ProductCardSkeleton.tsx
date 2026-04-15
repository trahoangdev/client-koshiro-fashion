import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardSkeletonProps {
  className?: string;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ className }) => {
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className || ''}`}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          
          {/* Product Name */}
          <Skeleton className="h-5 w-3/4" />
          
          {/* Product Name (secondary) */}
          <Skeleton className="h-4 w-1/2" />
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;

