import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { CartItem } from "@/lib/api";
import CloudinaryImage from '@/components/shared/CloudinaryImage';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  addedProduct?: CartItem | null;
  onViewCart?: () => void;
  onContinueShopping?: () => void;
}

const MiniCart: React.FC<MiniCartProps> = ({
  isOpen,
  onClose,
  cartItems,
  addedProduct,
  onViewCart,
  onContinueShopping,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation
      setTimeout(() => setShowAnimation(true), 10);

      // Auto close after 5 seconds if no interaction
      const timer = setTimeout(() => {
        if (isOpen) {
          handleClose();
        }
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowAnimation(false);
    setTimeout(() => onClose(), 200); // Wait for animation
  };

  const handleViewCart = () => {
    handleClose();
    if (onViewCart) {
      onViewCart();
    } else {
      navigate('/cart');
    }
  };

  const handleContinueShopping = () => {
    handleClose();
    if (onContinueShopping) {
      onContinueShopping();
    }
  };

  const getProductName = (product: CartItem['product']) => {
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.product.salePrice && item.product.salePrice < item.product.price
      ? item.product.salePrice
      : item.product.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  const translations = {
    en: {
      added: 'Added to Cart',
      itemAdded: 'Item added successfully!',
      itemsInCart: 'items in cart',
      subtotal: 'Subtotal',
      viewCart: 'View Cart',
      continueShopping: 'Continue Shopping',
      freeShipping: 'Free shipping on orders over',
    },
    vi: {
      added: 'Đã thêm vào giỏ',
      itemAdded: 'Đã thêm sản phẩm thành công!',
      itemsInCart: 'sản phẩm trong giỏ',
      subtotal: 'Tạm tính',
      viewCart: 'Xem Giỏ Hàng',
      continueShopping: 'Tiếp Tục Mua Sắm',
      freeShipping: 'Miễn phí vận chuyển cho đơn hàng trên',
    },
    ja: {
      added: 'カートに追加',
      itemAdded: 'アイテムが正常に追加されました！',
      itemsInCart: 'カート内のアイテム',
      subtotal: '小計',
      viewCart: 'カートを見る',
      continueShopping: 'ショッピングを続ける',
      freeShipping: '注文が以上の場合、配送無料',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-200 ${showAnimation ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleClose}
      />

      {/* Mini Cart Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-background shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${showAnimation ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col overflow-hidden pt-20">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CheckCircle2 className="h-5 w-5 text-green-600 animate-in fade-in zoom-in duration-300" />
                <div className="absolute inset-0 bg-green-600/20 rounded-full animate-ping" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{t.added}</h3>
                <p className="text-xs text-muted-foreground">{t.itemAdded}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Added Product Preview */}
          {addedProduct && (
            <div className="p-4 border-b bg-accent/30">
              <div className="flex gap-4 animate-in slide-in-from-right duration-300">
                <div className="relative">
                  {addedProduct.product.cloudinaryImages && addedProduct.product.cloudinaryImages.length > 0 ? (
                    <CloudinaryImage
                      publicId={addedProduct.product.cloudinaryImages[0].publicId}
                      secureUrl={addedProduct.product.cloudinaryImages[0].secureUrl}
                      responsiveUrls={addedProduct.product.cloudinaryImages[0].responsiveUrls}
                      alt={getProductName(addedProduct.product)}
                      className="w-16 h-16 rounded object-cover border"
                      size="thumbnail"
                    />
                  ) : (
                    <img
                      src={addedProduct.product.images?.[0] || '/placeholder.svg'}
                      alt={getProductName(addedProduct.product)}
                      className="w-16 h-16 rounded object-cover border"
                    />
                  )}
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {addedProduct.quantity}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {getProductName(addedProduct.product)}
                  </h4>
                  {(addedProduct.selectedSize || addedProduct.selectedColor) && (
                    <div className="flex gap-1 mt-1">
                      {addedProduct.selectedSize && (
                        <Badge variant="outline" className="text-xs">
                          {addedProduct.selectedSize}
                        </Badge>
                      )}
                      {addedProduct.selectedColor && (
                        <Badge variant="outline" className="text-xs">
                          {addedProduct.selectedColor}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-sm">
                      {formatCurrency(
                        addedProduct.product.salePrice && addedProduct.product.salePrice < addedProduct.product.price
                          ? addedProduct.product.salePrice
                          : addedProduct.product.price,
                        language
                      )}
                    </span>
                    {addedProduct.product.salePrice && addedProduct.product.salePrice < addedProduct.product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(addedProduct.product.price, language)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cart Items List (recent items) */}
          {cartItems.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {cartItems.length} {t.itemsInCart}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={handleViewCart}
                >
                  {language === 'vi' ? 'Xem tất cả' : language === 'ja' ? 'すべて見る' : 'View all'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {cartItems.slice(0, 3).map((item) => (
                <div
                  key={`${item.product._id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {item.product.cloudinaryImages && item.product.cloudinaryImages.length > 0 ? (
                    <CloudinaryImage
                      publicId={item.product.cloudinaryImages[0].publicId}
                      secureUrl={item.product.cloudinaryImages[0].secureUrl}
                      responsiveUrls={item.product.cloudinaryImages[0].responsiveUrls}
                      alt={getProductName(item.product)}
                      className="w-12 h-12 rounded object-cover border"
                      size="thumbnail"
                    />
                  ) : (
                    <img
                      src={item.product.images?.[0] || '/placeholder.svg'}
                      alt={getProductName(item.product)}
                      className="w-12 h-12 rounded object-cover border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      {getProductName(item.product)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(
                        item.product.salePrice && item.product.salePrice < item.product.price
                          ? item.product.salePrice
                          : item.product.price,
                        language
                      )}
                    </p>
                  </div>
                </div>
              ))}

              {cartItems.length > 3 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  +{cartItems.length - 3} {language === 'vi' ? 'sản phẩm khác' : language === 'ja' ? '他のアイテム' : 'more items'}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t p-4 space-y-3 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-sm">{t.subtotal}</span>
              <span className="font-semibold">
                {formatCurrency(subtotal, language)}
              </span>
            </div>

            <div className="text-xs text-muted-foreground text-center bg-green-50 dark:bg-green-950/20 p-2 rounded">
              {t.freeShipping} {formatCurrency(500000, language)}
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleContinueShopping}
              >
                {t.continueShopping}
              </Button>
              <Button
                className="flex-1"
                onClick={handleViewCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t.viewCart}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MiniCart;

