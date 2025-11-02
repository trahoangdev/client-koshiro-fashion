import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/lib/currency';
import { api, Product } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Truck } from 'lucide-react';
import { logger } from '@/lib/logger';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    logger.debug('Search query', { query });
  };

  // Load cart from API if authenticated, otherwise show empty
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getCart();
        if (response && response.items && Array.isArray(response.items)) {
          const cartItemsData = response.items
            .filter((item: { 
              productId: string; 
              quantity: number; 
              size?: string; 
              color?: string; 
              product: Product; 
            }) => item && item.product && item.product._id && item.product.images && Array.isArray(item.product.images)) // Filter out items with missing product data
            .map((item: { 
              productId: string; 
              quantity: number; 
              size?: string; 
              color?: string; 
              product: Product; 
            }) => ({
              productId: item.productId,
              product: item.product,
              quantity: item.quantity,
              selectedSize: item.size,
              selectedColor: item.color
            }));
          setCartItems(cartItemsData);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        logger.error('Error loading cart', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" : 
                 language === 'ja' ? "データ読み込みエラー" : 
                 "Error Loading Data",
          description: language === 'vi' ? "Không thể tải thông tin giỏ hàng" :
                       language === 'ja' ? "カート情報を読み込めませんでした" :
                       "Unable to load cart information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, toast, language]);

  const updateQuantity = async (productId: string, newQuantity: number, selectedSize?: string, selectedColor?: string) => {
    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? "Cần đăng nhập" : 
               language === 'ja' ? "ログインが必要です" : 
               "Login Required",
        description: language === 'vi' ? "Vui lòng đăng nhập để quản lý giỏ hàng" :
                     language === 'ja' ? "カートを管理するにはログインしてください" :
                     "Please login to manage cart",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(productId);
      await api.updateCartItem(productId, newQuantity);
      
      // Wait a bit to ensure API call is complete, then dispatch event
      setTimeout(() => {
        logger.debug('Dispatching cartUpdated event (CartPage update quantity)');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }, 100);
      
      setCartItems(prev => prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));

      toast({
        title: language === 'vi' ? "Cập nhật số lượng" : 
               language === 'ja' ? "数量を更新" : 
               "Quantity Updated",
        description: language === 'vi' ? "Số lượng đã được cập nhật" :
                     language === 'ja' ? "数量が更新されました" :
                     "Quantity has been updated",
      });
    } catch (error) {
      logger.error('Error updating quantity', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể cập nhật số lượng" :
                     language === 'ja' ? "数量を更新できませんでした" :
                     "Could not update quantity",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string, selectedSize?: string, selectedColor?: string) => {
    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? "Cần đăng nhập" : 
               language === 'ja' ? "ログインが必要です" : 
               "Login Required",
        description: language === 'vi' ? "Vui lòng đăng nhập để quản lý giỏ hàng" :
                     language === 'ja' ? "カートを管理するにはログインしてください" :
                     "Please login to manage cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.removeFromCart(productId);
      
      // Wait a bit to ensure API call is complete, then dispatch event
      setTimeout(() => {
        logger.debug('Dispatching cartUpdated event (CartPage remove item)');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }, 100);
      
      setCartItems(prev => prev.filter(item => item.productId !== productId));

      toast({
        title: language === 'vi' ? "Xóa sản phẩm" : 
               language === 'ja' ? "商品を削除" : 
               "Item Removed",
        description: language === 'vi' ? "Sản phẩm đã được xóa khỏi giỏ hàng" :
                     language === 'ja' ? "商品がカートから削除されました" :
                     "Item has been removed from cart",
      });
    } catch (error) {
      logger.error('Error removing item', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể xóa sản phẩm" :
                     language === 'ja' ? "商品を削除できませんでした" :
                     "Could not remove item",
        variant: "destructive",
      });
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 2000000 ? 0 : 50000; // Free shipping over 2M VND
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>{language === 'vi' ? "Đang tải..." : language === 'ja' ? "読み込み中..." : "Loading..."}</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            {!isAuthenticated ? (
              <>
                <h1 className="text-2xl font-bold mb-2">
                  {language === 'vi' ? 'Cần đăng nhập' :
                   language === 'ja' ? 'ログインが必要です' : 'Login Required'}
                </h1>
                <p className="text-muted-foreground mb-8">
                  {language === 'vi' ? 'Vui lòng đăng nhập để xem giỏ hàng của bạn' :
                   language === 'ja' ? 'カートを表示するにはログインしてください' :
                   'Please login to view your cart'}
                </p>
                <div className="space-x-4">
                  <Button onClick={() => navigate('/login')}>
                    {language === 'vi' ? 'Đăng Nhập' :
                     language === 'ja' ? 'ログイン' : 'Login'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/register')}>
                    {language === 'vi' ? 'Đăng Ký' :
                     language === 'ja' ? '登録' : 'Register'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-2">{language === 'vi' ? "Giỏ hàng trống" : language === 'ja' ? "カートは空です" : "Your cart is empty"}</h1>
                <p className="text-muted-foreground mb-8">{language === 'vi' ? "Bạn chưa có sản phẩm nào trong giỏ hàng" : language === 'ja' ? "カートに商品がありません" : "You don't have any items in your cart"}</p>
                <Button onClick={() => navigate('/')}>
                  {language === 'vi' ? "Tiếp tục mua sắm" : language === 'ja' ? "買い物を続ける" : "Continue Shopping"}
                </Button>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'vi' ? "Tiếp tục mua sắm" : language === 'ja' ? "買い物を続ける" : "Continue Shopping"}
          </Button>
          <h1 className="text-3xl font-bold">{language === 'vi' ? "Giỏ hàng" : language === 'ja' ? "ショッピングカート" : "Shopping Cart"}</h1>
          <Badge variant="secondary">{cartItems.length} items</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.product?._id || item.productId} className="overflow-hidden">
                <div className="flex">
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={item.product?.images?.[0] || '/placeholder.svg'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.product?.name || 'Product'}</h3>
                        <p className="text-muted-foreground text-sm">
                          {typeof item.product?.categoryId === 'string' 
                            ? 'Category' 
                            : item.product?.categoryId?.name || 'Category'}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product?._id || item.productId, item.selectedSize, item.selectedColor)}
                        disabled={updating === (item.product?._id || item.productId)}
                      >
                        {updating === (item.product?._id || item.productId) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      {item.selectedSize && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{language === 'vi' ? "Kích thước" : language === 'ja' ? "サイズ" : "Size"}:</span>
                          <Badge variant="outline">{item.selectedSize}</Badge>
                        </div>
                      )}
                      
                      {item.selectedColor && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{language === 'vi' ? "Màu sắc" : language === 'ja' ? "色" : "Color"}:</span>
                          <Badge variant="outline">{item.selectedColor}</Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product?._id || item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)}
                          disabled={item.quantity <= 1 || updating === (item.product?._id || item.productId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="1"
                          max={item.product?.stock || 1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product?._id || item.productId, parseInt(e.target.value) || 1, item.selectedSize, item.selectedColor)}
                          className="w-16 text-center"
                          disabled={updating === (item.product?._id || item.productId)}
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product?._id || item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)}
                          disabled={item.quantity >= (item.product?.stock || 1) || updating === (item.product?._id || item.productId)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {formatCurrency((item.product?.price || 0) * item.quantity, language)}
                        </div>
                        {item.product?.originalPrice && item.product.originalPrice > (item.product?.price || 0) && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatCurrency(item.product.originalPrice * item.quantity, language)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'vi' ? "Tóm tắt đơn hàng" : language === 'ja' ? "注文サマリー" : "Order Summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? "Tạm tính" : language === 'ja' ? "小計" : "Subtotal"}</span>
                    <span>{formatCurrency(calculateSubtotal(), language)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? "Phí vận chuyển" : language === 'ja' ? "配送料" : "Shipping"}</span>
                    <span className={calculateShipping() === 0 ? 'text-green-600' : ''}>
                      {calculateShipping() === 0 ? language === 'vi' ? "Miễn phí vận chuyển" : language === 'ja' ? "送料無料" : "Free Shipping" : formatCurrency(calculateShipping(), language)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>{language === 'vi' ? "Thuế" : language === 'ja' ? "税金" : "Tax"}</span>
                    <span>{formatCurrency(calculateTax(), language)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>{language === 'vi' ? "Tổng cộng" : language === 'ja' ? "合計" : "Total"}</span>
                    <span>{formatCurrency(calculateTotal(), language)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {language === 'vi' ? "Thanh toán" : language === 'ja' ? "チェックアウト" : "Proceed to Checkout"}
                  </Button>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>{language === 'vi' ? "Dự kiến giao hàng" : language === 'ja' ? "配送予定日" : "Estimated Delivery"}: {language === 'vi' ? "3-5 ngày làm việc" : language === 'ja' ? "3-5営業日" : "3-5 business days"}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    {language === 'vi' ? "Thanh toán an toàn" : language === 'ja' ? "安全なチェックアウト" : "Secure Checkout"}
                    <br />
                    {language === 'vi' ? "Thông tin của bạn được bảo vệ" : language === 'ja' ? "あなたの情報は保護されています" : "Your information is protected"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage; 