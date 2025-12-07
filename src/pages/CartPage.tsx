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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Card className="rounded-xl border-2 shadow-lg p-8">
              <CardContent className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-lg font-medium">{language === 'vi' ? "Đang tải..." : language === 'ja' ? "読み込み中..." : "Loading..."}</span>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-xl border-2 shadow-xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-muted/50">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                  </div>
                </div>
                {!isAuthenticated ? (
                  <>
                    <h1 className="text-3xl font-bold mb-3">
                      {language === 'vi' ? 'Cần đăng nhập' :
                       language === 'ja' ? 'ログインが必要です' : 'Login Required'}
                    </h1>
                    <p className="text-muted-foreground mb-8 text-lg">
                      {language === 'vi' ? 'Vui lòng đăng nhập để xem giỏ hàng của bạn' :
                       language === 'ja' ? 'カートを表示するにはログインしてください' :
                       'Please login to view your cart'}
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => navigate('/login')}
                        size="lg"
                        className="rounded-xl font-semibold px-8"
                      >
                        {language === 'vi' ? 'Đăng Nhập' :
                         language === 'ja' ? 'ログイン' : 'Login'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/register')}
                        size="lg"
                        className="rounded-xl font-semibold px-8"
                      >
                        {language === 'vi' ? 'Đăng Ký' :
                         language === 'ja' ? '登録' : 'Register'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-3">{language === 'vi' ? "Giỏ hàng trống" : language === 'ja' ? "カートは空です" : "Your cart is empty"}</h1>
                    <p className="text-muted-foreground mb-8 text-lg">{language === 'vi' ? "Bạn chưa có sản phẩm nào trong giỏ hàng" : language === 'ja' ? "カートに商品がありません" : "You don't have any items in your cart"}</p>
                    <Button 
                      onClick={() => navigate('/')}
                      size="lg"
                      className="rounded-xl font-semibold px-8"
                    >
                      {language === 'vi' ? "Tiếp tục mua sắm" : language === 'ja' ? "買い物を続ける" : "Continue Shopping"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="rounded-lg hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'vi' ? "Tiếp tục mua sắm" : language === 'ja' ? "買い物を続ける" : "Continue Shopping"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {language === 'vi' ? "Giỏ hàng" : language === 'ja' ? "ショッピングカート" : "Shopping Cart"}
              </h1>
              <Badge variant="secondary" className="text-base px-4 py-1.5">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {cartItems.length} {language === 'vi' ? "sản phẩm" : language === 'ja' ? "商品" : "items"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.product?._id || item.productId} className="overflow-hidden rounded-xl border-2 shadow-lg hover:shadow-xl transition-all">
                <div className="flex">
                  <div className="w-32 h-32 flex-shrink-0 bg-muted rounded-l-xl overflow-hidden">
                    <img
                      src={item.product?.images?.[0] || '/placeholder.svg'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {typeof item.product?.categoryId === 'string' 
                            ? 'Category' 
                            : item.product?.categoryId?.name || 'Category'}
                        </p>
                        <div className="flex items-center space-x-2 mb-3">
                          {item.selectedSize && (
                            <Badge variant="secondary" className="text-xs font-medium px-2 py-1 rounded-md">
                              {language === 'vi' ? "Size" : language === 'ja' ? "サイズ" : "Size"}: {item.selectedSize}
                            </Badge>
                          )}
                          {item.selectedColor && (
                            <Badge variant="secondary" className="text-xs font-medium px-2 py-1 rounded-md">
                              {language === 'vi' ? "Màu" : language === 'ja' ? "色" : "Color"}: {item.selectedColor}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product?._id || item.productId, item.selectedSize, item.selectedColor)}
                        disabled={updating === (item.product?._id || item.productId)}
                        className="rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all ml-2"
                      >
                        {updating === (item.product?._id || item.productId) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 mt-auto border-t">
                      <div className="flex items-center space-x-2 bg-muted/30 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.product?._id || item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)}
                          disabled={item.quantity <= 1 || updating === (item.product?._id || item.productId)}
                          className="rounded-md h-8 w-8 p-0 hover:bg-background"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="1"
                          max={item.product?.stock || 1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product?._id || item.productId, parseInt(e.target.value) || 1, item.selectedSize, item.selectedColor)}
                          className="w-14 text-center rounded-md border-0 bg-background font-semibold h-8"
                          disabled={updating === (item.product?._id || item.productId)}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.product?._id || item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)}
                          disabled={item.quantity >= (item.product?.stock || 1) || updating === (item.product?._id || item.productId)}
                          className="rounded-md h-8 w-8 p-0 hover:bg-background"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-primary mb-1">
                          {formatCurrency((item.product?.price || 0) * item.quantity, language)}
                        </div>
                        {item.product?.originalPrice && item.product.originalPrice > (item.product?.price || 0) && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatCurrency(item.product.originalPrice * item.quantity, language)}
                          </div>
                        )}
                        {item.product?.price && item.product.originalPrice && item.product.originalPrice > item.product.price && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            -{Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)}%
                          </Badge>
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
            <Card className="rounded-xl border-2 shadow-xl sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">{language === 'vi' ? "Tóm tắt đơn hàng" : language === 'ja' ? "注文サマリー" : "Order Summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">{language === 'vi' ? "Tạm tính" : language === 'ja' ? "小計" : "Subtotal"}</span>
                    <span className="font-semibold">{formatCurrency(calculateSubtotal(), language)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">{language === 'vi' ? "Phí vận chuyển" : language === 'ja' ? "配送料" : "Shipping"}</span>
                    <span className={calculateShipping() === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                      {calculateShipping() === 0 ? language === 'vi' ? "Miễn phí" : language === 'ja' ? "送料無料" : "Free" : formatCurrency(calculateShipping(), language)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">{language === 'vi' ? "Thuế" : language === 'ja' ? "税金" : "Tax"}</span>
                    <span className="font-semibold">{formatCurrency(calculateTax(), language)}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">{language === 'vi' ? "Tổng cộng" : language === 'ja' ? "合計" : "Total"}</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(calculateTotal(), language)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    className="w-full rounded-xl font-semibold text-lg h-12 shadow-lg hover:shadow-xl transition-all" 
                    size="lg" 
                    onClick={() => navigate('/checkout')}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {language === 'vi' ? "Thanh toán" : language === 'ja' ? "チェックアウト" : "Proceed to Checkout"}
                  </Button>
                  
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      {language === 'vi' ? "Dự kiến giao hàng" : language === 'ja' ? "配送予定日" : "Estimated Delivery"}: {language === 'vi' ? "3-5 ngày làm việc" : language === 'ja' ? "3-5営業日" : "3-5 business days"}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center p-2 rounded-lg bg-primary/5">
                    {language === 'vi' ? "🔒 Thanh toán an toàn" : language === 'ja' ? "🔒 安全なチェックアウト" : "🔒 Secure Checkout"}
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