import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, 
  Truck, 
  CheckCircle, 
  ArrowLeft,
  Lock,
  Shield,
  Loader2,
  DollarSign,
  Smartphone,
  Banknote,
  QrCode,
  Wallet
} from "lucide-react";
import { Link } from "react-router-dom";

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Vietnam",
    // Payment Information
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    // Additional
    notes: ""
  });
  const { language } = useLanguage();
  const { toast } = useToast();

  // Load cart items from API if authenticated
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
            }) => {
              // More lenient filtering - just check essential fields
              if (!item || !item.product) {
                console.warn('Cart item missing product:', item);
                return false;
              }
              if (!item.product._id) {
                console.warn('Cart item product missing ID:', item.product);
                return false;
              }
              return true;
            })
            .map((item: { 
              productId: string; 
              quantity: number; 
              size?: string; 
              color?: string; 
              product: Product; 
            }) => ({
              productId: item.productId,
              product: {
                ...item.product,
                images: item.product.images || [] // Ensure images is always an array
              },
              quantity: item.quantity,
              selectedSize: item.size,
              selectedColor: item.color
            }));
          console.log('Loaded cart items:', cartItemsData);
          setCartItems(cartItemsData);
        } else {
          console.warn('Invalid cart response:', response);
          setCartItems([]);
        }
        
        // Pre-fill form with user data if authenticated
        if (isAuthenticated && user) {
          setFormData(prev => ({
            ...prev,
            firstName: user.name.split(' ')[0] || '',
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
          }));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải giỏ hàng" : 
                 language === 'ja' ? "カート読み込みエラー" : 
                 "Error Loading Cart",
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
  }, [isAuthenticated, user, toast, language]);

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      if (cartItems.length === 0) {
        navigate('/cart');
      }
    }
  }, [loading, cartItems.length, navigate, isAuthenticated]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 2000000 ? 0 : 50000; // Free shipping over 2M VND
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Search query:', query);
  };

  const translations = {
    en: {
      title: "Checkout",
      subtitle: "Complete Your Purchase",
      shippingInfo: "Shipping Information",
      payment: "Payment Information",
      paymentMethod: "Payment Method",
      cod: "Cash on Delivery",
      codDescription: "Pay when you receive your order",
      online: "Online Payment",
      onlineDescription: "Pay now with card or e-wallet",
      creditCard: "Credit/Debit Card",
      eWallet: "E-Wallet",
      bankTransfer: "Bank Transfer",
      codInstructions: "Cash on Delivery Instructions",
      codInstructionsList: [
        "Prepare exact amount for faster delivery",
        "Payment accepted: cash only", 
        "Delivery fee may apply for remote areas",
        "Please check your order before payment"
      ],
      orderSummary: "Order Summary",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State/Province",
      zipCode: "ZIP/Postal Code",
      country: "Country",
      cardNumber: "Card Number",
      cardName: "Name on Card",
      expiryMonth: "Month",
      expiryYear: "Year",
      cvv: "CVV",
      notes: "Order Notes (Optional)",
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Tax",
      total: "Total",
      placeOrder: "Place Order",
      processing: "Processing...",
      backToCart: "Back to Cart",
      secure: "Secure Checkout",
      secureDescription: "Your payment information is encrypted and secure",
      orderComplete: "Order Complete!",
      orderCompleteDescription: "Thank you for your purchase. You will receive an email confirmation shortly.",
      orderNumber: "Order #12345",
      continueShopping: "Continue Shopping"
    },
    vi: {
      title: "Thanh Toán",
      subtitle: "Hoàn Tất Đơn Hàng",
      shippingInfo: "Thông Tin Giao Hàng",
      payment: "Thông Tin Thanh Toán",
      paymentMethod: "Phương Thức Thanh Toán",
      cod: "Thanh Toán Khi Nhận Hàng",
      codDescription: "Thanh toán khi bạn nhận được hàng",
      online: "Thanh Toán Trực Tuyến",
      onlineDescription: "Thanh toán ngay bằng thẻ hoặc ví điện tử",
      creditCard: "Thẻ Tín Dụng/Ghi Nợ",
      eWallet: "Ví Điện Tử",
      bankTransfer: "Chuyển Khoản Ngân Hàng",
      codInstructions: "Hướng Dẫn Thanh Toán Khi Nhận Hàng",
      codInstructionsList: [
        "Chuẩn bị số tiền chính xác để giao hàng nhanh hơn",
        "Chỉ chấp nhận thanh toán bằng tiền mặt",
        "Phí giao hàng có thể áp dụng cho vùng xa",
        "Vui lòng kiểm tra đơn hàng trước khi thanh toán"
      ],
      orderSummary: "Tóm Tắt Đơn Hàng",
      firstName: "Tên",
      lastName: "Họ",
      email: "Địa Chỉ Email",
      phone: "Số Điện Thoại",
      address: "Địa Chỉ",
      city: "Thành Phố",
      state: "Tỉnh/Thành",
      zipCode: "Mã Bưu Điện",
      country: "Quốc Gia",
      cardNumber: "Số Thẻ",
      cardName: "Tên Trên Thẻ",
      expiryMonth: "Tháng",
      expiryYear: "Năm",
      cvv: "CVV",
      notes: "Ghi Chú Đơn Hàng (Tùy Chọn)",
      subtotal: "Tạm Tính",
      shipping: "Phí Vận Chuyển",
      tax: "Thuế",
      total: "Tổng Cộng",
      placeOrder: "Đặt Hàng",
      processing: "Đang Xử Lý...",
      backToCart: "Quay Lại Giỏ Hàng",
      secure: "Thanh Toán An Toàn",
      secureDescription: "Thông tin thanh toán của bạn được mã hóa và bảo mật",
      orderComplete: "Đặt Hàng Thành Công!",
      orderCompleteDescription: "Cảm ơn bạn đã mua hàng. Bạn sẽ nhận được email xác nhận trong thời gian ngắn.",
      orderNumber: "Đơn Hàng #12345",
      continueShopping: "Tiếp Tục Mua Sắm"
    },
    ja: {
      title: "チェックアウト",
      subtitle: "購入を完了",
      shippingInfo: "配送情報",
      payment: "支払い情報",
      paymentMethod: "支払い方法",
      cod: "代金引換",
      codDescription: "商品受け取り時にお支払い",
      online: "オンライン決済",
      onlineDescription: "カードまたは電子マネーですぐにお支払い",
      creditCard: "クレジット/デビットカード",
      eWallet: "電子マネー",
      bankTransfer: "銀行振込",
      codInstructions: "代金引換の注意事項",
      codInstructionsList: [
        "配達をスムーズにするため正確な金額をご準備ください",
        "現金のみ受け付けます",
        "遠隔地の場合は配送料が発生する場合があります",
        "お支払い前に注文内容をご確認ください"
      ],
      orderSummary: "注文サマリー",
      firstName: "名",
      lastName: "姓",
      email: "メールアドレス",
      phone: "電話番号",
      address: "住所",
      city: "市区町村",
      state: "都道府県",
      zipCode: "郵便番号",
      country: "国",
      cardNumber: "カード番号",
      cardName: "カード名義人",
      expiryMonth: "月",
      expiryYear: "年",
      cvv: "CVV",
      notes: "注文メモ（任意）",
      subtotal: "小計",
      shipping: "配送料",
      tax: "税金",
      total: "合計",
      placeOrder: "注文する",
      processing: "処理中...",
      backToCart: "カートに戻る",
      secure: "セキュアチェックアウト",
      secureDescription: "お支払い情報は暗号化され、安全です",
      orderComplete: "注文完了！",
      orderCompleteDescription: "ご購入ありがとうございます。確認メールをすぐにお送りします。",
      orderNumber: "注文番号 #12345",
      continueShopping: "ショッピングを続ける"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để tiếp tục thanh toán",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty. Please add items before checkout.');
      }

      // Validate each cart item
      for (const item of cartItems) {
        if (!item.product || !item.product._id) {
          throw new Error('Some products in your cart are no longer available. Please refresh and try again.');
        }
        if (item.quantity <= 0) {
          throw new Error('Invalid quantity detected. Please check your cart.');
        }
      }

      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city || !formData.state) {
        throw new Error('Please fill in all required fields');
      }

      // Validate payment method specific fields
      if (paymentMethod === 'online') {
        if (!formData.cardNumber || !formData.cardName || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
          throw new Error('Please fill in all card details for online payment');
        }
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || item.product._id, // Fallback to product._id
          quantity: item.quantity,
          price: item.product.price, // Include price for validation
          size: item.selectedSize,
          color: item.selectedColor
        })),
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.state
        },
        billingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.state
        },
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        notes: formData.notes
      };

      // Debug: Log order data
      console.log('Creating order with data:', orderData);
      console.log('Cart items before order:', cartItems);
      
      // Create order via API
      const response = await api.createOrder(orderData);
      console.log('Order created successfully:', response);
      
      setIsProcessing(false);
      setIsCompleted(true);
      
      // Clear cart after successful order (with error handling)
      try {
        await api.clearCart();
        console.log('Cart cleared successfully');
      } catch (clearError) {
        console.warn('Failed to clear cart automatically:', clearError);
        // Don't fail the checkout if cart clearing fails
        // User can manually clear cart later
      }
      
      toast({
        title: language === 'vi' ? 'Đặt hàng thành công!' : language === 'ja' ? 'ご注文が完了しました！' : 'Order placed successfully!',
        description: language === 'vi' ? 'Đơn hàng của bạn đã được xác nhận và sẽ được giao sớm.' : language === 'ja' ? 'ご注文が確認され、まもなく発送されます。' : 'Your order has been confirmed and will be delivered soon.',
      });
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      setIsProcessing(false);
      
      // Better error message handling
      let errorMessage = language === 'vi' ? 'Có lỗi xảy ra khi đặt hàng' : language === 'ja' ? '注文処理中にエラーが発生しました' : 'An error occurred while placing the order';
      if (error instanceof Error) {
        if (error.message.includes('Product not found in cart')) {
          errorMessage = language === 'vi' ? 'Giỏ hàng đã thay đổi. Vui lòng kiểm tra lại giỏ hàng và thử lại.' : language === 'ja' ? 'カートが変更されました。内容を確認してもう一度お試しください。' : 'Your cart has changed. Please review your cart and try again.';
        } else if (error.message.includes('Insufficient stock')) {
          errorMessage = language === 'vi' ? 'Sản phẩm không đủ số lượng trong kho. Vui lòng giảm số lượng.' : language === 'ja' ? '在庫が不足しています。数量を減らしてください。' : 'Insufficient stock. Please reduce the quantity.';
        } else if (error.message.includes('Product') && error.message.includes('not found')) {
          errorMessage = language === 'vi' ? 'Một số sản phẩm không còn tồn tại. Vui lòng kiểm tra lại giỏ hàng.' : language === 'ja' ? '一部の商品が存在しません。カートをご確認ください。' : 'Some products no longer exist. Please review your cart.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: language === 'vi' ? 'Lỗi đặt hàng' : language === 'ja' ? '注文エラー' : 'Order Error',
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header cartItemsCount={0} onSearch={handleSearch} />
        <main className="py-8">
          <div className="container space-y-8">
            {/* Hero Banner */}
            <section className="text-center">
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"></div>
                <div className="relative z-10 py-16">
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce" />
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.orderComplete}</h1>
                  <p className="text-xl text-muted-foreground mb-6">{t.orderCompleteDescription}</p>
                  <Badge variant="secondary" className="text-lg px-6 py-2 mb-8">{t.orderNumber}</Badge>
                  <div className="flex justify-center gap-4">
                    <Link to="/">
                      <Button size="lg" className="modern-gradient text-white">
                        {t.continueShopping}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header cartItemsCount={0} onSearch={handleSearch} />
        <main className="py-8">
          <div className="container space-y-8">
            <section className="text-center py-16">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground text-lg">
                {language === 'vi' ? 'Đang tải...' : language === 'ja' ? '読み込み中...' : 'Loading...'}
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />

      <main className="py-8">
        <div className="container space-y-8">
          {/* Hero Banner */}
          <section className="text-center mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Banner Background */}
              <div className="absolute inset-0">
                <img 
                  src="/images/banners/banner-01.png" 
                  alt="Checkout Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                    <CreditCard className="h-12 w-12 md:h-16 md:w-16 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl mb-6 text-white/90 font-light leading-relaxed">
                  {t.subtitle}
                </p>
                <Link to="/cart">
                  <Button variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t.backToCart}
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Checkout Form and Order Summary */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-background/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg font-bold">
                      <div className="p-2 rounded-lg bg-primary/10 mr-3">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      {t.shippingInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">{t.firstName}</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                          className="rounded-lg border-2 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">{t.lastName}</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                          className="rounded-lg border-2 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">{t.email}</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="rounded-lg border-2 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">{t.phone}</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                          className="rounded-lg border-2 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">{t.address}</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        className="rounded-lg border-2 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">{t.city}</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                          className="rounded-lg border-2 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">{t.state}</label>
                        <Input
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                          className="rounded-lg border-2 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">{t.zipCode}</label>
                        <Input
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          required
                          className="rounded-lg border-2 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">{t.country}</label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                        <SelectTrigger className="rounded-lg border-2 focus:border-primary transition-all">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-2">
                          <SelectItem value="japan" className="rounded-md">Japan</SelectItem>
                          <SelectItem value="vietnam" className="rounded-md">Vietnam</SelectItem>
                          <SelectItem value="usa" className="rounded-md">United States</SelectItem>
                          <SelectItem value="uk" className="rounded-md">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-background/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg font-bold">
                      <div className="p-2 rounded-lg bg-primary/10 mr-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      {t.payment}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Payment Method Selection */}
                    <div>
                      <label className="text-lg font-semibold mb-6 block">{t.paymentMethod}</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* COD Option */}
                        <div
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            paymentMethod === 'cod'
                              ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                              : 'border-muted hover:border-primary/50 bg-muted/30 hover:bg-muted/50'
                          }`}
                          onClick={() => setPaymentMethod('cod')}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-full ${
                              paymentMethod === 'cod' ? 'bg-primary text-primary-foreground' : 'bg-background'
                            }`}>
                              <Banknote className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-2">{t.cod}</h3>
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed font-medium">{t.codDescription}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs px-2 py-1 rounded-lg border-2 font-semibold">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Cash
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Online Payment Option */}
                        <div
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            paymentMethod === 'online'
                              ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                              : 'border-muted hover:border-primary/50 bg-muted/30 hover:bg-muted/50'
                          }`}
                          onClick={() => setPaymentMethod('online')}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-full ${
                              paymentMethod === 'online' ? 'bg-primary text-primary-foreground' : 'bg-background'
                            }`}>
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-2">{t.online}</h3>
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed font-medium">{t.onlineDescription}</p>
                              <div className="flex items-center space-x-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs px-2 py-1 mb-1 rounded-lg border-2 font-semibold">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Card
                                </Badge>
                                <Badge variant="secondary" className="text-xs px-2 py-1 mb-1 rounded-lg border-2 font-semibold">
                                  <Smartphone className="h-3 w-3 mr-1" />
                                  E-Wallet
                                </Badge>
                                <Badge variant="secondary" className="text-xs px-2 py-1 mb-1 rounded-lg border-2 font-semibold">
                                  <QrCode className="h-3 w-3 mr-1" />
                                  QR
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Online Payment Details */}
                    {paymentMethod === 'online' && (
                      <div className="space-y-6 p-6 rounded-xl border-2 border-primary/20 bg-muted/30">
                        <div className="flex items-center space-x-3 mb-5 pb-4 border-b-2 border-primary/20">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                            <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-bold text-green-700 dark:text-green-300">Secure Payment</span>
                        </div>
                        
                        {/* Card Details */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold mb-2 block">{t.cardNumber}</label>
                            <Input
                              value={formData.cardNumber}
                              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                              placeholder="1234 5678 9012 3456"
                              required={paymentMethod === 'online'}
                              className="rounded-lg border-2 focus:border-primary transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold mb-2 block">{t.cardName}</label>
                            <Input
                              value={formData.cardName}
                              onChange={(e) => handleInputChange('cardName', e.target.value)}
                              placeholder="John Doe"
                              required={paymentMethod === 'online'}
                              className="rounded-lg border-2 focus:border-primary transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-semibold mb-2 block">{t.expiryMonth}</label>
                              <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                                <SelectTrigger className="rounded-lg border-2 focus:border-primary transition-all">
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-2">
                                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                                    <SelectItem key={month} value={month.toString().padStart(2, '0')} className="rounded-md">
                                      {month.toString().padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-semibold mb-2 block">{t.expiryYear}</label>
                              <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                                <SelectTrigger className="rounded-lg border-2 focus:border-primary transition-all">
                                  <SelectValue placeholder="YYYY" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-2">
                                  {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                                    <SelectItem key={year} value={year.toString()} className="rounded-md">
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-semibold mb-2 block">{t.cvv}</label>
                              <Input
                                value={formData.cvv}
                                onChange={(e) => handleInputChange('cvv', e.target.value)}
                                placeholder="123"
                                maxLength={4}
                                required={paymentMethod === 'online'}
                                className="rounded-lg border-2 focus:border-primary transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Alternative Payment Methods */}
                        <div className="pt-5 border-t border-stone-200/50 dark:border-stone-700/50">
                          <p className="text-sm font-semibold mb-4 text-stone-700 dark:text-stone-300">Or pay with:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-20 flex-col hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/50 transition-all duration-300 hover:scale-105 border-stone-200/60 dark:border-stone-700/60"
                            >
                              <Wallet className="h-5 w-5 mb-2 text-primary" />
                              <span className="text-xs font-medium">Momo</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-20 flex-col hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/50 transition-all duration-300 hover:scale-105 border-stone-200/60 dark:border-stone-700/60"
                            >
                              <Smartphone className="h-5 w-5 mb-2 text-primary" />
                              <span className="text-xs font-medium">ZaloPay</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-20 flex-col hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/50 transition-all duration-300 hover:scale-105 border-stone-200/60 dark:border-stone-700/60"
                            >
                              <QrCode className="h-5 w-5 mb-2 text-primary" />
                              <span className="text-xs font-medium">VietQR</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-20 flex-col hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/50 transition-all duration-300 hover:scale-105 border-stone-200/60 dark:border-stone-700/60"
                            >
                              <CreditCard className="h-5 w-5 mb-2 text-primary" />
                              <span className="text-xs font-medium">Visa/MC</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COD Information */}
                    {paymentMethod === 'cod' && (
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-start space-x-4">
                          <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                            <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 text-lg">{t.codInstructions}</h4>
                            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2.5">
                              {t.codInstructionsList.map((instruction, index) => (
                                <li key={index} className="flex items-start space-x-2.5">
                                  <span className="text-blue-500 dark:text-blue-400 mt-1 font-bold">•</span>
                                  <span className="leading-relaxed flex-1">{instruction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card className="rounded-xl border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-background/95 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <label className="text-sm font-semibold mb-2 block">{t.notes}</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      placeholder="Any special instructions or notes..."
                      className="resize-none rounded-lg border-2 focus:border-primary transition-all"
                    />
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="rounded-xl border-2 shadow-xl hover:shadow-2xl transition-all overflow-hidden bg-background/95 backdrop-blur-sm sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">{t.orderSummary}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <Card key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${index}`} className="rounded-lg border-2 hover:shadow-md transition-all overflow-hidden bg-muted/30">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.product.images?.[0] || '/placeholder.svg'}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg border-2"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground font-medium">
                                {item.selectedSize} • {item.selectedColor} • Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold text-sm flex-shrink-0 text-primary">{formatCurrency(item.product.price * item.quantity, language)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">{t.subtotal}</span>
                      <span className="font-bold">{formatCurrency(subtotal, language)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">{t.shipping}</span>
                      <span className="font-bold">{formatCurrency(shipping, language)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">{t.tax}</span>
                      <span className="font-bold">{formatCurrency(tax, language)}</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-bold text-lg pt-2 p-3 rounded-lg bg-primary/10 border-l-4 border-primary">
                      <span>{t.total}</span>
                      <span className="text-primary">
                        {formatCurrency(total, language)}
                      </span>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <Card className="rounded-lg border-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-green-800 dark:text-green-300">{t.secure}</p>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-1 font-medium">{t.secureDescription}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Place Order Button */}
                  <Button 
                    className="w-full rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t.processing}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        {t.placeOrder}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage; 