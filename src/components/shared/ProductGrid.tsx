import { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

const ProductGrid = ({ products, onAddToCart, onAddToWishlist, onAddToCompare }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onAddToCompare={onAddToCompare}
        />
      ))}
    </div>
  );
};

export default ProductGrid;