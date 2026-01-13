import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/api";
import { ShoppingBag, Heart, Star, GitCompare, Link as LinkIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from "./MarkdownRenderer";
import { CloudinaryImage } from "./CloudinaryImage";
import { useMemo, useCallback, memo } from "react";

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

// Helper function to get image source (Cloudinary or legacy)
const getImageSource = (product: Product, index: number = 0): string => {
  // Check if product has Cloudinary images
  if (product.cloudinaryImages && product.cloudinaryImages.length > index) {
    return product.cloudinaryImages[index].responsiveUrls.medium;
  }

  // Fallback to legacy images
  if (product.images && product.images.length > index) {
    return product.images[index];
  }

  return '/placeholder.svg';
};

// Helper function to render image with Cloudinary support
const renderProductImage = (product: Product, index: number, alt: string, className: string) => {
  // Check if product has Cloudinary images
  if (product.cloudinaryImages && product.cloudinaryImages.length > index) {
    const cloudinaryImage = product.cloudinaryImages[index];
    return (
      <CloudinaryImage
        publicId={cloudinaryImage.publicId}
        secureUrl={cloudinaryImage.secureUrl}
        responsiveUrls={cloudinaryImage.responsiveUrls}
        alt={alt}
        size="medium"
        className={className}
        loading="lazy"
      />
    );
  }

  // Fallback to legacy images
  if (product.images && product.images.length > index) {
    return (
      <img
        src={product.images[index]}
        alt={alt}
        className={className}
        loading="lazy"
      />
    );
  }

  // Placeholder
  return (
    <img
      src="/placeholder.svg"
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

import { getColorHex } from "@/lib/colors";

const ProductCard = ({ product, viewMode = 'grid', onAddToCart, onAddToWishlist, onAddToCompare }: ProductCardProps) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Memoize product name based on language
  const productName = useMemo(() => {
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  }, [product.name, product.nameEn, product.nameJa, language]);

  // Memoize product description based on language
  const productDescription = useMemo(() => {
    switch (language) {
      case 'vi': return product.description;
      case 'ja': return product.descriptionJa || product.description;
      default: return product.descriptionEn || product.description;
    }
  }, [product.description, product.descriptionEn, product.descriptionJa, language]);

  // Memoize discount percentage calculation
  const discountPercentage = useMemo(() => {
    if (product.salePrice && product.salePrice < product.price) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }, [product.price, product.salePrice, product.originalPrice]);

  // Memoize price calculations
  const { isOnSale, displayPrice, originalDisplayPrice } = useMemo(() => {
    const isOnSale = product.onSale || (product.salePrice && product.salePrice < product.price);
    const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    const originalDisplayPrice = product.salePrice && product.salePrice < product.price ? product.price : product.originalPrice;
    return { isOnSale, displayPrice, originalDisplayPrice };
  }, [product.onSale, product.salePrice, product.price, product.originalPrice]);

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWishlist?.(product);

    // Show toast notification using centralized translation
    toast({
      title: t('success'),
      description: t('addedToWishlist'),
    });
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCompare?.(product);

    // Show toast notification
    toast({
      title: language === 'vi' ? "Thành công" : language === 'ja' ? "成功" : "Success",
      description: language === 'vi' ? "Đã thêm vào danh sách so sánh" :
        language === 'ja' ? "比較リストに追加されました" :
          "Added to compare list",
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden border-stone-200/60 dark:border-stone-700/60 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-500 cursor-pointer rounded-xl bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 backdrop-blur-sm hover:scale-[1.01]" onClick={handleCardClick}>
        <div className="flex">
          <div className="relative w-48 min-h-48 flex-shrink-0 rounded-l-xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800">
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
            {/* Primary Image - Default */}
            {renderProductImage(product, 0, productName, "w-full h-full object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-110")}

            {/* Secondary Image - On Hover */}
            {getImageSource(product, 1) !== '/placeholder.svg' && (
              <div className="absolute inset-0 w-full h-full transition-all duration-700 opacity-0 group-hover:opacity-100">
                {renderProductImage(product, 1, productName, "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110")}
              </div>
            )}

            {/* Fallback: If no second image, show zoom effect on first image */}
            {getImageSource(product, 1) === '/placeholder.svg' && (
              <div className="absolute inset-0 w-full h-full transition-all duration-700 opacity-0 group-hover:opacity-100">
                {renderProductImage(product, 0, productName, "w-full h-full object-cover transition-transform duration-700 group-hover:scale-125")}
              </div>
            )}

            {/* Badges Container - Left side only to avoid covering action buttons */}
            <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 max-w-[120px]">
              {/* Stock Status - Highest priority */}
              {product.stock <= 0 && (
                <Badge variant="secondary" className="bg-stone-500/95 text-white border-0 backdrop-blur-md shadow-lg text-xs px-2.5 py-1 animate-pulse">
                  {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
                </Badge>
              )}

              {/* Sale Badge - Show when on sale and in stock */}
              {product.stock > 0 && isOnSale && discountPercentage > 0 && (
                <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-red-600 hover:to-red-700 transition-all duration-300">
                  -{discountPercentage}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
                </Badge>
              )}

              {/* Limited Edition Badge - When not on sale and not stock issue */}
              {product.stock > 0 && !isOnSale && product.isLimitedEdition && (
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
                  {language === 'vi' ? 'Giới hạn' : language === 'ja' ? '限定' : 'Limited'}
                </Badge>
              )}

              {/* Featured Badge - When not on sale and not stock issue */}
              {product.stock > 0 && !isOnSale && product.isFeatured && (
                <Badge variant="default" className="bg-gradient-to-r from-stone-700 to-stone-800 dark:from-stone-300 dark:to-stone-400 text-white dark:text-stone-900 border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-stone-800 hover:to-stone-900 dark:hover:from-stone-400 dark:hover:to-stone-500 transition-all duration-300">
                  {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
                </Badge>
              )}

              {/* New Badge - When not on sale and not stock issue */}
              {product.stock > 0 && !isOnSale && product.isNew && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 animate-pulse">
                  {language === 'vi' ? 'MỚI' : language === 'ja' ? '新着' : 'NEW'}
                </Badge>
              )}

              {/* Best Seller Badge - When not on sale and not stock issue */}
              {product.stock > 0 && !isOnSale && product.isBestSeller && (
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-orange-600 hover:to-amber-700 transition-all duration-300">
                  {language === 'vi' ? 'Bán chạy' : language === 'ja' ? 'ベストセラー' : 'Best Seller'}
                </Badge>
              )}
            </div>

            {/* Action Icons - Enhanced Style */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
              {onAddToWishlist && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 bg-white/95 dark:bg-stone-800/95 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-full shadow-xl backdrop-blur-md border border-stone-200/60 dark:border-stone-600/60 hover:border-red-300/50 dark:hover:border-red-500/50 hover:scale-110 transition-all duration-300 hover:shadow-red-200/50 dark:hover:shadow-red-900/30"
                  onClick={handleAddToWishlist}
                  title={language === 'vi' ? 'Thêm vào yêu thích' : language === 'ja' ? 'お気に入りに追加' : 'Add to Wishlist'}
                >
                  <Heart className="h-4 w-4 text-stone-600 dark:text-stone-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300" />
                </Button>
              )}
              {onAddToCompare && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 bg-white/95 dark:bg-stone-800/95 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 rounded-full shadow-xl backdrop-blur-md border border-stone-200/60 dark:border-stone-600/60 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:scale-110 transition-all duration-300 hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30"
                  onClick={handleAddToCompare}
                  title={language === 'vi' ? 'Thêm vào so sánh' : language === 'ja' ? '比較リストに追加' : 'Add to Compare'}
                >
                  <LinkIcon className="h-4 w-4 text-stone-600 dark:text-stone-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" />
                </Button>
              )}
            </div>
          </div>

          <CardContent className="flex-1 p-5 pb-4 bg-gradient-to-b from-transparent to-stone-50/30 dark:to-stone-900/30 overflow-hidden relative z-10">
            <div className="flex flex-col h-full min-h-0">
              <div className="space-y-3 flex-1 min-h-0 overflow-hidden">
                <h3 className="font-semibold text-lg leading-tight mb-2.5 text-stone-900 dark:text-stone-100 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[3rem]">{productName}</h3>
                <div className="text-muted-foreground text-sm line-clamp-3 flex-shrink-0">
                  <MarkdownRenderer
                    content={productDescription || 'Premium Japanese fashion item with authentic design and quality materials.'}
                    className="text-sm"
                    stripMarkdown
                  />
                </div>

                {/* Rating - Enhanced */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 transition-all duration-300 ${star <= 4 // Mock rating of 4 stars
                          ? 'text-yellow-400 fill-current group-hover:text-yellow-500 group-hover:scale-110'
                          : 'text-gray-300 dark:text-gray-600'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                    (4.0)
                  </span>
                </div>

                {/* Colors - Enhanced */}
                <div className="flex-shrink-0">
                  <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Colors'}:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {/* Show actual colors if available */}
                    {product.colors && product.colors.length > 0 ? (
                      <>
                        {product.colors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-700 shadow-md hover:scale-125 hover:shadow-lg transition-all duration-300 cursor-pointer flex-shrink-0"
                            style={{
                              backgroundColor: getColorHex(color)
                            }}
                            title={color}
                          />
                        ))}
                        {product.colors.length > 4 && (
                          <span className="text-xs font-medium text-muted-foreground flex items-center flex-shrink-0">
                            +{product.colors.length - 4}
                          </span>
                        )}
                      </>
                    ) : (
                      /* Show default colors when no colors are specified */
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-700 shadow-md bg-gray-300 flex-shrink-0" title="Default" />
                        <div className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-700 shadow-md bg-blue-300 flex-shrink-0" title="Default" />
                        <div className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-700 shadow-md bg-green-300 flex-shrink-0" title="Default" />
                        <span className="text-xs font-medium text-muted-foreground flex items-center flex-shrink-0">
                          {language === 'vi' ? 'Mặc định' : language === 'ja' ? 'デフォルト' : 'Default'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stock Status */}
                <p className="text-sm font-medium text-muted-foreground flex-shrink-0">
                  {product.stock > 0 ?
                    (language === 'vi' ? `${product.stock} còn lại` :
                      language === 'ja' ? `残り${product.stock}個` :
                        `${product.stock} left`) :
                    (language === 'vi' ? 'Hết hàng' :
                      language === 'ja' ? '在庫切れ' :
                        'Out of stock')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-200/50 dark:border-stone-700/50 flex-shrink-0 gap-2">
                <div className="flex items-center space-x-2 min-w-0 flex-shrink">
                  <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                    {formatCurrency(displayPrice, language)}
                  </span>
                  {originalDisplayPrice && originalDisplayPrice > displayPrice && (
                    <span className="text-base text-muted-foreground line-through opacity-60 flex-shrink-0 whitespace-nowrap">
                      {formatCurrency(originalDisplayPrice, language)}
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="bg-gradient-to-r from-stone-700 to-stone-800 dark:from-stone-600 dark:to-stone-700 hover:from-stone-800 hover:to-stone-900 dark:hover:from-stone-500 dark:hover:to-stone-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-medium hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  size="sm"
                  variant="default"
                >
                  <ShoppingBag className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{language === 'vi' ? 'Thêm vào giỏ' : language === 'ja' ? 'カートに追加' : 'Add to Cart'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-stone-200/60 dark:border-stone-700/60 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-500 cursor-pointer rounded-xl h-full flex flex-col bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 backdrop-blur-sm hover:scale-[1.02] hover:-translate-y-1" onClick={handleCardClick}>
      {/* Image Section - Flexible height with aspect ratio */}
      <div className="relative overflow-hidden rounded-t-xl aspect-[4/5] w-full flex-shrink-0 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800">
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
        {/* Primary Image - Default */}
        {renderProductImage(product, 0, productName, "w-full h-full object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-110")}

        {/* Secondary Image - On Hover */}
        {getImageSource(product, 1) !== '/placeholder.svg' && (
          <div className="absolute inset-0 w-full h-full transition-all duration-700 opacity-0 group-hover:opacity-100">
            {renderProductImage(product, 1, productName, "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110")}
          </div>
        )}

        {/* Fallback: If no second image, show zoom effect on first image */}
        {getImageSource(product, 1) === '/placeholder.svg' && (
          <div className="absolute inset-0 w-full h-full transition-all duration-700 opacity-0 group-hover:opacity-100">
            {renderProductImage(product, 0, productName, "w-full h-full object-cover transition-transform duration-700 group-hover:scale-125")}
          </div>
        )}

        {/* Badges Container - Left side only to avoid covering action buttons */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
          {/* Stock Status - Highest priority */}
          {product.stock <= 0 && (
            <Badge variant="secondary" className="bg-stone-500/95 text-white border-0 backdrop-blur-md shadow-lg text-xs px-2.5 py-1 animate-pulse">
              {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
            </Badge>
          )}

          {/* Sale Badge - Show when on sale and in stock */}
          {product.stock > 0 && isOnSale && discountPercentage > 0 && (
            <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-red-600 hover:to-red-700 transition-all duration-300">
              -{discountPercentage}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
            </Badge>
          )}

          {/* Limited Edition Badge - When not on sale */}
          {product.stock > 0 && !isOnSale && product.isLimitedEdition && (
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
              {language === 'vi' ? 'Giới hạn' : language === 'ja' ? '限定' : 'Limited'}
            </Badge>
          )}

          {/* Featured Badge */}
          {product.stock > 0 && product.isFeatured && (
            <Badge variant="default" className="bg-gradient-to-r from-stone-700 to-stone-800 dark:from-stone-300 dark:to-stone-400 text-white dark:text-stone-900 border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-stone-800 hover:to-stone-900 dark:hover:from-stone-400 dark:hover:to-stone-500 transition-all duration-300">
              {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
            </Badge>
          )}

          {/* New Badge */}
          {product.stock > 0 && product.isNew && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 animate-pulse">
              {language === 'vi' ? 'MỚI' : language === 'ja' ? '新着' : 'NEW'}
            </Badge>
          )}

          {/* Best Seller Badge */}
          {product.stock > 0 && product.isBestSeller && (
            <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 backdrop-blur-md shadow-lg font-semibold text-xs px-2.5 py-1 hover:from-orange-600 hover:to-amber-700 transition-all duration-300">
              {language === 'vi' ? 'Bán chạy' : language === 'ja' ? 'ベストセラー' : 'Best Seller'}
            </Badge>
          )}
        </div>

        {/* Action Icons - Enhanced Style */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
          {onAddToWishlist && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-white/95 dark:bg-stone-800/95 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-full shadow-xl backdrop-blur-md border border-stone-200/60 dark:border-stone-600/60 hover:border-red-300/50 dark:hover:border-red-500/50 hover:scale-110 transition-all duration-300 hover:shadow-red-200/50 dark:hover:shadow-red-900/30"
              onClick={handleAddToWishlist}
              title={language === 'vi' ? 'Thêm vào yêu thích' : language === 'ja' ? 'お気に入りに追加' : 'Add to Wishlist'}
            >
              <Heart className="h-4 w-4 text-stone-600 dark:text-stone-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300" />
            </Button>
          )}
          {onAddToCompare && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-white/95 dark:bg-stone-800/95 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 rounded-full shadow-xl backdrop-blur-md border border-stone-200/60 dark:border-stone-600/60 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:scale-110 transition-all duration-300 hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30"
              onClick={handleAddToCompare}
              title={language === 'vi' ? 'Thêm vào so sánh' : language === 'ja' ? '比較リストに追加' : 'Add to Compare'}
            >
              <LinkIcon className="h-4 w-4 text-stone-600 dark:text-stone-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Section - Flexible height with proper spacing */}
      <CardContent className="p-4 pb-4 flex-1 flex flex-col min-h-0 bg-gradient-to-b from-transparent to-stone-50/30 dark:to-stone-900/30 overflow-hidden relative z-10">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Product Name */}
          <h3 className="font-semibold text-base leading-tight mb-2 text-stone-900 dark:text-stone-100 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 line-clamp-2 flex-shrink-0">
            {productName}
          </h3>

          {/* Product Description - Compact */}
          <div className="text-muted-foreground text-xs line-clamp-2 mb-2 leading-relaxed flex-shrink-0">
            <MarkdownRenderer
              content={productDescription || 'Premium Japanese fashion item with authentic design and quality materials.'}
              className="text-xs"
              stripMarkdown
            />
          </div>

          {/* Rating - Enhanced */}
          <div className="flex items-center gap-2 mb-2 flex-shrink-0">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 transition-all duration-300 ${star <= 4 // Mock rating of 4 stars
                    ? 'text-yellow-400 fill-current group-hover:text-yellow-500 group-hover:scale-110'
                    : 'text-gray-300 dark:text-gray-600'
                    }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
              (4.0)
            </span>
          </div>

          {/* Colors - Enhanced */}
          <div className="mb-2 flex-shrink-0">
            <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Colors'}:
            </p>
            <div className="flex gap-2 flex-wrap">
              {/* Show actual colors if available */}
              {product.colors && product.colors.length > 0 ? (
                <>
                  {product.colors.slice(0, 4).map((color, index) => (
                    <div
                      key={index}
                      className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-700 shadow-md hover:scale-125 hover:shadow-lg transition-all duration-300 cursor-pointer flex-shrink-0"
                      style={{
                        backgroundColor: getColorHex(color)
                      }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-xs font-medium text-muted-foreground flex items-center flex-shrink-0">
                      +{product.colors.length - 4}
                    </span>
                  )}
                </>
              ) : (
                /* Show default colors when no colors are specified */
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-700 shadow-md bg-gray-300 flex-shrink-0" title="Default" />
                  <div className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-700 shadow-md bg-blue-300 flex-shrink-0" title="Default" />
                  <div className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-700 shadow-md bg-green-300 flex-shrink-0" title="Default" />
                  <span className="text-xs font-medium text-muted-foreground flex items-center flex-shrink-0">
                    {language === 'vi' ? 'Mặc định' : language === 'ja' ? 'デフォルト' : 'Default'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Price and Button - Fixed at bottom */}
        <div className="mt-auto pt-3 pb-0 border-t border-stone-200/50 dark:border-stone-700/50 flex-shrink-0">
          {/* Price */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {formatCurrency(displayPrice, language)}
            </span>
            {originalDisplayPrice && originalDisplayPrice > displayPrice && (
              <span className="text-sm text-muted-foreground line-through opacity-60 flex-shrink-0">
                {formatCurrency(originalDisplayPrice, language)}
              </span>
            )}
          </div>

          {/* Add to Cart Button - Enhanced */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full bg-gradient-to-r from-stone-700 to-stone-800 dark:from-stone-600 dark:to-stone-700 hover:from-stone-800 hover:to-stone-900 dark:hover:from-stone-500 dark:hover:to-stone-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-medium hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            size="sm"
            variant="default"
          >
            <ShoppingBag className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{language === 'vi' ? 'Thêm vào giỏ' : language === 'ja' ? 'カートに追加' : 'Add to Cart'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(ProductCard);