import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product } from "@/lib/api";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "./ProductGridSkeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, List, ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface InfiniteProductGridProps {
  /** All products to display (accumulated from multiple pages) */
  products: Product[];
  /** Callback when more products should be loaded */
  onLoadMore: () => void;
  /** Whether more products are available */
  hasMore: boolean;
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Whether initial data is loading */
  isLoadingInitial?: boolean;
  /** Add to cart callback */
  onAddToCart?: (product: Product) => void;
  /** Add to wishlist callback */
  onAddToWishlist?: (product: Product) => void;
  /** Add to compare callback */
  onAddToCompare?: (product: Product) => void;
  /** Whether infinite scroll is enabled */
  enableInfiniteScroll?: boolean;
  /** Custom sort function */
  customSort?: (products: Product[]) => Product[];
}

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-a-z' | 'name-z-a' | 'popular';
type ViewMode = 'grid' | 'list';

const InfiniteProductGrid: React.FC<InfiniteProductGridProps> = ({
  products,
  onLoadMore,
  hasMore,
  isLoading = false,
  isLoadingInitial = false,
  onAddToCart,
  onAddToWishlist,
  onAddToCompare,
  enableInfiniteScroll = true,
  customSort,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Sort products
  const sortedProducts = useMemo(() => {
    if (customSort) {
      return customSort([...products]);
    }

    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      case 'price-high':
        return sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      case 'name-a-z':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-z-a':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'popular':
        return sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [products, sortBy, customSort]);

  // Infinite scroll hook
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore,
    enabled: enableInfiniteScroll && hasMore && !isLoading,
    hasMore,
    isLoading,
    threshold: 300,
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-a-z', label: 'Name: A to Z' },
    { value: 'name-z-a', label: 'Name: Z to A' },
    { value: 'popular', label: 'Most Popular' },
  ];

  if (isLoadingInitial) {
    return (
      <div className="space-y-6">
        {/* Toolbar Skeleton */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-9 w-40 bg-muted rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-9 w-9 bg-muted rounded animate-pulse" />
              <div className="h-9 w-9 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
        <ProductGridSkeleton count={12} columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
          </span>
          {hasMore && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              More available
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Grid3X3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
          )}>
            {sortedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                onAddToCompare={onAddToCompare}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading more products...</p>
              </div>
            </div>
          )}

          {/* Infinite scroll sentinel - placed after products */}
          {enableInfiniteScroll && hasMore && (
            <div 
              ref={sentinelRef} 
              className="h-4 w-full" 
              aria-hidden="true"
            />
          )}

          {/* Load more button (fallback if infinite scroll is disabled) */}
          {!enableInfiniteScroll && hasMore && !isLoading && (
            <div className="flex justify-center py-8">
              <Button onClick={onLoadMore} variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          )}

          {/* End of results message */}
          {!hasMore && sortedProducts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                You've reached the end of the results
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InfiniteProductGrid;

