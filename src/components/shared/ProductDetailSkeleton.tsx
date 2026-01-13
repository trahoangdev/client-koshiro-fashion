import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Options */}
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Size */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-16 rounded-md" />
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-32 rounded-md" />
                  <Skeleton className="h-12 flex-1 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardContent className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12 space-y-4">
        <div className="flex gap-4 border-b">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;

