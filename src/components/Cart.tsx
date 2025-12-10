import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, X, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useLanguage } from "@/contexts/LanguageContext";
import { CartItem } from "@/lib/api";

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
}

const Cart = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClose
}: CartProps) => {
  const { language } = useLanguage();
  const translations = {
    en: {
      cart: "Shopping Cart",
      empty: "Your cart is empty",
      emptyDesc: "Add some beautiful items to get started",
      item: "item",
      items: "items",
      subtotal: "Subtotal",
      shipping: "Shipping",
      free: "Free",
      total: "Total",
      checkout: "Proceed to Checkout",
      continueShopping: "Continue Shopping"
    },
    vi: {
      cart: "Giỏ Hàng",
      empty: "Giỏ hàng trống",
      emptyDesc: "Thêm một số sản phẩm đẹp để bắt đầu",
      item: "sản phẩm",
      items: "sản phẩm",
      subtotal: "Tạm tính",
      shipping: "Vận chuyển",
      free: "Miễn phí",
      total: "Tổng cộng",
      checkout: "Tiến Hành Thanh Toán",
      continueShopping: "Tiếp Tục Mua Sắm"
    },
    ja: {
      cart: "ショッピングカート",
      empty: "カートは空です",
      emptyDesc: "美しいアイテムを追加して始めましょう",
      item: "アイテム",
      items: "アイテム",
      subtotal: "小計",
      shipping: "配送料",
      free: "無料",
      total: "合計",
      checkout: "チェックアウトに進む",
      continueShopping: "ショッピングを続ける"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getProductName = (item: CartItem) => {
    switch (language) {
      case 'vi': return item.product.name;
      case 'ja': return item.product.nameJa || item.product.name;
      default: return item.product.nameEn || item.product.name;
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.product.salePrice && item.product.salePrice < item.product.price
      ? item.product.salePrice
      : item.product.price;
    return sum + (itemPrice * item.quantity);
  }, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {t.cart} (0 {t.items})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.empty}</h3>
            <p className="text-muted-foreground mb-6">{t.emptyDesc}</p>
            <Button variant="default" onClick={onClose}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t.continueShopping}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            {t.cart} ({cartItems.length} {cartItems.length === 1 ? t.item : t.items})
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cartItems.map((item) => (
          <div key={`${item.product._id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 p-4 bg-card border rounded-lg hover:shadow-sm transition-shadow">
            <img
              src={item.product.images?.[0]}
              alt={getProductName(item)}
              className="w-20 h-20 object-cover rounded"
            />

            <div className="flex-1 space-y-2">
              <h4 className="font-medium">{getProductName(item)}</h4>
              <div className="flex gap-2">
                <Badge variant="secondary">{item.selectedColor}</Badge>
                <Badge variant="secondary">{item.selectedSize}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-semibold">
                    {item.product.salePrice && item.product.salePrice < item.product.price ? formatCurrency(item.product.salePrice, language) : formatCurrency(item.product.price, language)}
                  </span>
                  {item.product.salePrice && item.product.salePrice < item.product.price && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(item.product.price, language)}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        -{Math.round(((item.product.price - item.product.salePrice) / item.product.price) * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(`${item.product._id}-${item.selectedColor}-${item.selectedSize}`, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(`${item.product._id}-${item.selectedColor}-${item.selectedSize}`, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onRemoveItem(`${item.product._id}-${item.selectedColor}-${item.selectedSize}`)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t p-4 space-y-4">
        <div className="flex justify-between">
          <span>{t.subtotal}</span>
          <span className="font-semibold">
            {formatCurrency(subtotal, language)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{t.shipping}</span>
          <span className="text-green-600 font-medium">{t.free}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-semibold">
          <span>{t.total}</span>
          <span>
            {formatCurrency(total, language)}
          </span>
        </div>
        <Button variant="default" size="lg" className="w-full font-semibold" onClick={onCheckout}>
          <Lock className="h-4 w-4 mr-2" />
          {t.checkout}
        </Button>
      </div>
    </div>
  );
};

export default Cart;