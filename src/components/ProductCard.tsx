import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/api";
import { ShoppingBag, Heart, Star, GitCompare, Link as LinkIcon, Play } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from "./MarkdownRenderer";
import { CloudinaryImage } from "./CloudinaryImage";

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

// Helper function to check if product has videos
const hasVideo = (product: Product): boolean => {
  return !!(product.videos && Array.isArray(product.videos) && product.videos.length > 0);
};

// Helper function to get first video
const getFirstVideo = (product: Product) => {
  if (hasVideo(product) && product.videos && product.videos.length > 0) {
    return product.videos[0];
  }
  return null;
};

// Helper function to get video thumbnail (from first image or video poster)
const getVideoThumbnail = (product: Product): string => {
  // Try to use first product image as thumbnail
  if (product.cloudinaryImages && product.cloudinaryImages.length > 0) {
    return product.cloudinaryImages[0].responsiveUrls.medium;
  }
  if (product.galleryImages && product.galleryImages.length > 0) {
    return product.galleryImages[0].responsiveUrls.medium;
  }
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return '/placeholder.svg';
};

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

// Helper function to get hex color from color name
const getColorHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    // Vietnamese colors
    'Đỏ': '#ef4444',
    'Xanh dương': '#3b82f6',
    'Xanh nhạt': '#93c5fd',
    'Xanh lá': '#22c55e',
    'Vàng': '#eab308',
    'Hồng': '#ec4899',
    'Tím': '#a855f7',
    'Cam': '#f97316',
    'Nâu': '#a16207',
    'Đen': '#000000',
    'Trắng': '#ffffff',
    'Xám': '#6b7280',
    'Xám đậm': '#374151',
    'Xám nhạt': '#d1d5db',
    'Bạc': '#c0c0c0',
    'Vàng kim': '#ffd700',
    
    // English colors
    'Red': '#ef4444',
    'Blue': '#3b82f6',
    'Light Blue': '#93c5fd',
    'Green': '#22c55e',
    'Yellow': '#eab308',
    'Pink': '#ec4899',
    'Purple': '#a855f7',
    'Orange': '#f97316',
    'Brown': '#a16207',
    'Black': '#000000',
    'White': '#ffffff',
    'Gray': '#6b7280',
    'Dark Gray': '#374151',
    'Light Gray': '#d1d5db',
    'Silver': '#c0c0c0',
    'Gold': '#ffd700',
    
    // Japanese colors
    '赤': '#ef4444',
    '青': '#3b82f6',
    '薄い青': '#93c5fd',
    '緑': '#22c55e',
    '黄色': '#eab308',
    'ピンク': '#ec4899',
    '紫': '#a855f7',
    'オレンジ': '#f97316',
    '茶色': '#a16207',
    '黒': '#000000',
    '白': '#ffffff',
    'グレー': '#6b7280',
    '濃いグレー': '#374151',
    '薄いグレー': '#d1d5db',
    'シルバー': '#c0c0c0',
    'ゴールド': '#ffd700',
  };
  
  // Check if it's already a hex color
  if (colorName.startsWith('#')) {
    return colorName;
  }
  
  // Return mapped color or default gray
  return colorMap[colorName] || '#6b7280';
};

const ProductCard = ({ product, viewMode = 'grid', onAddToCart, onAddToWishlist, onAddToCompare }: ProductCardProps) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getName = () => {
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };

  const getDescription = () => {
    switch (language) {
      case 'vi': return product.description;
      case 'ja': return product.descriptionJa || product.description;
      default: return product.descriptionEn || product.description;
    }
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (product.salePrice && product.salePrice < product.price) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const discountPercentage = getDiscountPercentage();
  const isOnSale = product.onSale || (product.salePrice && product.salePrice < product.price);
  const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const originalDisplayPrice = product.salePrice && product.salePrice < product.price ? product.price : product.originalPrice;

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
      <Card className="group overflow-hidden border-stone-200/60 dark:border-stone-700/60 hover:shadow-lg hover:border-stone-300/80 dark:hover:border-stone-600/80 transition-all duration-500 cursor-pointer rounded-xl bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm" onClick={handleCardClick}>
        <div className="flex">
          <div className="relative w-48 h-48 flex-shrink-0 rounded-l-md overflow-hidden">
            {/* Primary Image - Default */}
            {renderProductImage(product, 0, getName(), "w-full h-full object-cover transition-all duration-500 group-hover:opacity-0")}
            
            {/* Secondary Image - On Hover */}
            {getImageSource(product, 1) !== '/placeholder.svg' && (
              <div className="absolute inset-0 w-full h-full transition-all duration-500 opacity-0 group-hover:opacity-100">
                {renderProductImage(product, 1, getName(), "w-full h-full object-cover")}
              </div>
            )}
            
            {/* Fallback: If no second image, show zoom effect on first image */}
            {getImageSource(product, 1) === '/placeholder.svg' && (
              <div className="absolute inset-0 w-full h-full transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110">
                {renderProductImage(product, 0, getName(), "w-full h-full object-cover")}
              </div>
            )}
            
            {/* Badges Container - Left side only to avoid covering action buttons */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 max-w-[120px]">
              {/* Stock Status - Highest priority */}
              {product.stock <= 0 && (
                <Badge variant="secondary" className="bg-stone-500/90 text-white border-0 backdrop-blur-sm text-xs w-fit">
                  {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
                </Badge>
              )}
              
              {/* Sale Badge - Show when on sale and in stock */}
              {product.stock > 0 && isOnSale && discountPercentage > 0 && (
                <Badge variant="destructive" className="bg-red-500/90 text-white border-0 backdrop-blur-sm font-medium text-xs w-fit">
                  -{discountPercentage}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
                </Badge>
              )}
              
              {/* Limited Edition Badge - When not on sale and not stock issue */}
              {product.stock > 0 && !isOnSale && product.isLimitedEdition && (
                <Badge className="bg-purple-500/90 text-white border-0 backdrop-blur-sm font-medium text-xs w-fit">
                  {language === 'vi' ? 'Giới hạn' : language === 'ja' ? '限定' : 'Limited'}
                </Badge>
              )}
              
              {/* Featured Badge - When not on sale and not stock issue */}
              {product.stock > 0 && !isOnSale && product.isFeatured && (
                <Badge variant="default" className="bg-stone-800/90 dark:bg-stone-200/90 text-white dark:text-stone-800 border-0 backdrop-blur-sm font-medium text-xs w-fit">
                  {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
                </Badge>
              )}
              
              {/* New Badge - When not on sale and not stock issue */}
              {product.stock > 0 && !isOnSale && product.isNew && (
                <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm font-medium text-xs w-fit">
                  {language === 'vi' ? 'MỚI' : language === 'ja' ? '新着' : 'NEW'}
                </Badge>
              )}
              
              {/* Best Seller Badge - When not on sale and not stock issue */}
              {product.stock > 0 && !isOnSale && product.isBestSeller && (
                <Badge className="bg-orange-500/90 text-white border-0 backdrop-blur-sm font-medium text-xs w-fit">
                  {language === 'vi' ? 'Bán chạy' : language === 'ja' ? 'ベストセラー' : 'Best Seller'}
                </Badge>
              )}
            </div>

            {/* Action Icons - Zen Style */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {onAddToWishlist && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800 rounded-full shadow-lg backdrop-blur-sm border border-stone-200/50 dark:border-stone-600/50"
                  onClick={handleAddToWishlist}
                  title={language === 'vi' ? 'Thêm vào yêu thích' : language === 'ja' ? 'お気に入りに追加' : 'Add to Wishlist'}
                >
                  <Heart className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                </Button>
              )}
              {onAddToCompare && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800 rounded-full shadow-lg backdrop-blur-sm border border-stone-200/50 dark:border-stone-600/50"
                  onClick={handleAddToCompare}
                  title={language === 'vi' ? 'Thêm vào so sánh' : language === 'ja' ? '比較リストに追加' : 'Add to Compare'}
                >
                  <LinkIcon className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                </Button>
              )}
            </div>
          </div>
          
          <CardContent className="flex-1 p-6">
            <div className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                <h3 className="font-light text-lg leading-tight mb-2 text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors duration-300">{getName()}</h3>
                <div className="text-muted-foreground text-sm line-clamp-3">
                  <MarkdownRenderer 
                    content={getDescription() || 'Premium Japanese fashion item with authentic design and quality materials.'}
                    className="text-sm"
                  />
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= 4 // Mock rating of 4 stars
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    (4.0)
                  </span>
                </div>
                  
                {/* Colors */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Colors'}:
                  </p>
                  <div className="flex gap-1">
                    {/* Show actual colors if available */}
                    {product.colors && product.colors.length > 0 ? (
                      <>
                        {product.colors.slice(0, 4).map((color, index) => (
                      <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ 
                              backgroundColor: getColorHex(color)
                            }}
                            title={color}
                      />
                    ))}
                        {product.colors.length > 4 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            +{product.colors.length - 4}
                          </span>
                        )}
                      </>
                    ) : (
                      /* Show default colors when no colors are specified */
                      <>
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-300" title="Default" />
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-blue-300" title="Default" />
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-green-300" title="Default" />
                        <span className="text-xs text-muted-foreground ml-1">
                          {language === 'vi' ? 'Mặc định' : language === 'ja' ? 'デフォルト' : 'Default'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Stock Status */}
                <p className="text-sm text-muted-foreground">
                  {product.stock > 0 ? 
                    (language === 'vi' ? `${product.stock} còn lại` : 
                     language === 'ja' ? `残り${product.stock}個` : 
                     `${product.stock} left`) : 
                    (language === 'vi' ? 'Hết hàng' : 
                     language === 'ja' ? '在庫切れ' : 
                     'Out of stock')}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(displayPrice, language)}
                  </span>
                  {originalDisplayPrice && originalDisplayPrice > displayPrice && (
                    <span className="text-base text-muted-foreground line-through">
                      {formatCurrency(originalDisplayPrice, language)}
                    </span>
                  )}
                </div>
                  
                  <Button
                    variant={product.stock <= 0 ? "secondary" : "outline"}
                    size="sm"
                    disabled={product.stock <= 0}
                    onClick={handleAddToCart}
                    className="border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-300 font-light"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                  {language === 'vi' ? 'Thêm vào giỏ' : language === 'ja' ? 'カートに追加' : 'Add to Cart'}
                  </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-stone-200/60 dark:border-stone-700/60 hover:shadow-lg hover:border-stone-300/80 dark:hover:border-stone-600/80 transition-all duration-500 cursor-pointer rounded-xl h-[520px] flex flex-col bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm" onClick={handleCardClick}>
      {/* Image/Video Section - Fixed height for consistency */}
      <div className="relative overflow-hidden rounded-t-md h-[280px] flex-shrink-0">
        {/* Video Section - Show if product has videos */}
        {hasVideo(product) && getFirstVideo(product) ? (
          <>
            {/* Video thumbnail with play overlay */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={getVideoThumbnail(product)}
                alt={getName()}
                className="w-full h-full object-cover transition-all duration-500"
              />
              {/* Play button overlay - visible on hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all duration-300">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-16 w-16 rounded-full shadow-xl bg-white/90 hover:bg-white backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to product detail where video can be played
                      navigate(`/product/${product._id}`);
                    }}
                  >
                    <Play className="h-8 w-8 ml-1 text-stone-900" />
                  </Button>
                </div>
              </div>
              {/* Video indicator badge */}
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-black/70 text-white backdrop-blur-sm text-xs px-2 py-1">
                  <Play className="h-3 w-3 mr-1" />
                  {language === 'vi' ? 'Video' : language === 'ja' ? 'ビデオ' : 'Video'}
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Primary Image - Default */}
            {renderProductImage(product, 0, getName(), "w-full h-full object-cover transition-all duration-500 group-hover:opacity-0")}
            
            {/* Secondary Image - On Hover */}
            {getImageSource(product, 1) !== '/placeholder.svg' && (
              <div className="absolute inset-0 w-full h-full transition-all duration-500 opacity-0 group-hover:opacity-100">
                {renderProductImage(product, 1, getName(), "w-full h-full object-cover")}
              </div>
            )}
            
            {/* Fallback: If no second image, show zoom effect on first image */}
            {getImageSource(product, 1) === '/placeholder.svg' && (
              <div className="absolute inset-0 w-full h-full transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110">
                {renderProductImage(product, 0, getName(), "w-full h-full object-cover")}
              </div>
            )}
          </>
        )}
        
        {/* Badges Container - Left side only to avoid covering action buttons */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {/* Stock Status - Highest priority */}
          {product.stock <= 0 && (
            <Badge variant="secondary" className="bg-stone-500/90 text-white border-0 backdrop-blur-sm text-xs">
              {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
            </Badge>
          )}
          
          {/* Sale Badge - Show when on sale and in stock */}
          {product.stock > 0 && isOnSale && discountPercentage > 0 && (
            <Badge variant="destructive" className="bg-red-500/90 text-white border-0 backdrop-blur-sm font-medium text-xs">
              -{discountPercentage}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
            </Badge>
          )}
          
          {/* Limited Edition Badge - When not on sale */}
          {product.stock > 0 && !isOnSale && product.isLimitedEdition && (
            <Badge className="bg-purple-500/90 text-white border-0 backdrop-blur-sm font-medium text-xs">
              {language === 'vi' ? 'Giới hạn' : language === 'ja' ? '限定' : 'Limited'}
            </Badge>
          )}
          
          {/* Featured Badge */}
          {product.stock > 0 && product.isFeatured && (
            <Badge variant="default" className="bg-stone-800/90 dark:bg-stone-200/90 text-white dark:text-stone-800 border-0 backdrop-blur-sm font-medium text-xs">
              {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
            </Badge>
          )}
          
          {/* New Badge */}
          {product.stock > 0 && product.isNew && (
            <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm font-medium text-xs">
              {language === 'vi' ? 'MỚI' : language === 'ja' ? '新着' : 'NEW'}
            </Badge>
          )}
          
          {/* Best Seller Badge */}
          {product.stock > 0 && product.isBestSeller && (
            <Badge className="bg-orange-500/90 text-white border-0 backdrop-blur-sm font-medium text-xs">
              {language === 'vi' ? 'Bán chạy' : language === 'ja' ? 'ベストセラー' : 'Best Seller'}
            </Badge>
          )}
        </div>
        
        {/* Action Icons - Zen Style */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {onAddToWishlist && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800 rounded-full shadow-lg backdrop-blur-sm border border-stone-200/50 dark:border-stone-600/50"
              onClick={handleAddToWishlist}
              title={language === 'vi' ? 'Thêm vào yêu thích' : language === 'ja' ? 'お気に入りに追加' : 'Add to Wishlist'}
            >
              <Heart className="h-4 w-4 text-stone-600 dark:text-stone-400" />
            </Button>
          )}
          {onAddToCompare && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800 rounded-full shadow-lg backdrop-blur-sm border border-stone-200/50 dark:border-stone-600/50"
              onClick={handleAddToCompare}
              title={language === 'vi' ? 'Thêm vào so sánh' : language === 'ja' ? '比較リストに追加' : 'Add to Compare'}
            >
              <LinkIcon className="h-4 w-4 text-stone-600 dark:text-stone-400" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content Section - Fixed height to ensure price/button visibility */}
      <CardContent className="p-6 h-[240px] flex flex-col">
        {/* Product Name */}
        <h3 className="font-light text-base leading-tight mb-2 text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors duration-300">
          {getName()}
        </h3>
          
        {/* Product Description - Compact */}
        <div className="text-muted-foreground text-xs line-clamp-2 mb-2">
          <MarkdownRenderer 
            content={getDescription() || 'Premium Japanese fashion item with authentic design and quality materials.'}
            className="text-xs"
          />
        </div>
          
        {/* Rating - Compact */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= 4 // Mock rating of 4 stars
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            (4.0)
          </span>
        </div>
            
        {/* Colors - Compact */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">
            {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Colors'}:
          </p>
            <div className="flex gap-1">
            {/* Show actual colors if available */}
            {product.colors && product.colors.length > 0 ? (
              <>
                {product.colors.slice(0, 4).map((color, index) => (
                <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ 
                      backgroundColor: getColorHex(color)
                    }}
                    title={color}
                />
              ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{product.colors.length - 4}
                  </span>
                )}
              </>
            ) : (
              /* Show default colors when no colors are specified */
              <>
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-300" title="Default" />
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-blue-300" title="Default" />
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-green-300" title="Default" />
                <span className="text-xs text-muted-foreground ml-1">
                  {language === 'vi' ? 'Mặc định' : language === 'ja' ? 'デフォルト' : 'Default'}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Price and Button - Fixed at bottom */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-red-600">
                {formatCurrency(displayPrice, language)}
              </span>
              {originalDisplayPrice && originalDisplayPrice > displayPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(originalDisplayPrice, language)}
                </span>
              )}
          </div>
          
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-300 font-light"
            size="sm"
            variant="outline"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Thêm vào giỏ' : language === 'ja' ? 'カートに追加' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;