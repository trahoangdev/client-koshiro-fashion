import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { api, Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Loader2
} from "lucide-react";

const OrderTrackingPage = () => {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    try {
      const order = await api.trackOrder(orderNumber);
      setOrder(order);
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: language === 'vi' ? "Lỗi tìm kiếm" :
          language === 'ja' ? "検索エラー" :
            "Search Error",
        description: language === 'vi' ? "Không thể tìm thấy đơn hàng" :
          language === 'ja' ? "注文が見つかりませんでした" :
            "Order not found",
        variant: "destructive",
      });
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <Clock className="h-6 w-6 text-red-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return language === 'vi' ? 'Chờ xử lý' : language === 'ja' ? '処理待ち' : 'Pending';
      case 'processing':
        return language === 'vi' ? 'Đang xử lý' : language === 'ja' ? '処理中' : 'Processing';
      case 'completed':
        return language === 'vi' ? 'Hoàn thành' : language === 'ja' ? '完了' : 'Completed';
      case 'cancelled':
        return language === 'vi' ? 'Đã hủy' : language === 'ja' ? 'キャンセル' : 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const translations = {
    en: {
      title: "Order Tracking",
      subtitle: "Track your order status",
      searchPlaceholder: "Enter order number...",
      search: "Track Order",
      orderDetails: "Order Details",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      status: "Status",
      total: "Total",
      items: "Items",
      shippingAddress: "Shipping Address",
      paymentMethod: "Payment Method",
      paymentStatus: "Payment Status",
      noOrder: "No order found",
      noOrderDesc: "Enter an order number to track your order",
      loading: "Searching...",
      notFound: "Order not found",
      notFoundDesc: "Please check your order number and try again"
    },
    vi: {
      title: "Theo Dõi Đơn Hàng",
      subtitle: "Kiểm tra trạng thái đơn hàng của bạn",
      searchPlaceholder: "Nhập số đơn hàng...",
      search: "Theo Dõi",
      orderDetails: "Chi Tiết Đơn Hàng",
      orderNumber: "Số Đơn Hàng",
      orderDate: "Ngày Đặt",
      status: "Trạng Thái",
      total: "Tổng Cộng",
      items: "Sản Phẩm",
      shippingAddress: "Địa Chỉ Giao Hàng",
      paymentMethod: "Phương Thức Thanh Toán",
      paymentStatus: "Trạng Thái Thanh Toán",
      noOrder: "Chưa có đơn hàng",
      noOrderDesc: "Nhập số đơn hàng để theo dõi",
      loading: "Đang tìm kiếm...",
      notFound: "Không tìm thấy đơn hàng",
      notFoundDesc: "Vui lòng kiểm tra số đơn hàng và thử lại"
    },
    ja: {
      title: "注文追跡",
      subtitle: "注文の状況を確認",
      searchPlaceholder: "注文番号を入力...",
      search: "追跡",
      orderDetails: "注文詳細",
      orderNumber: "注文番号",
      orderDate: "注文日",
      status: "状況",
      total: "合計",
      items: "商品",
      shippingAddress: "配送先住所",
      paymentMethod: "支払い方法",
      paymentStatus: "支払い状況",
      noOrder: "注文が見つかりません",
      noOrderDesc: "注文番号を入力して注文を追跡してください",
      loading: "検索中...",
      notFound: "注文が見つかりません",
      notFoundDesc: "注文番号を確認して再試行してください"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


      <main className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Banner Background */}
              <div className="absolute inset-0">
                <img
                  src={settings?.banners?.tracking || "/images/banners/banner-03.png"}
                  alt="Order Tracking Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </section>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1 rounded-lg border-2 focus:border-primary transition-all pl-10"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all px-8"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  <span>{t.search}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Details */}
          {order && (
            <Card className="max-w-4xl mx-auto rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold mb-2">{t.orderDetails}</CardTitle>
                    <p className="text-muted-foreground font-medium">{order.orderNumber}</p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2 font-semibold rounded-lg border-2`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{getStatusText(order.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-2 text-foreground">{t.orderNumber}</h4>
                    <p className="text-muted-foreground font-medium">{order.orderNumber}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-2 text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t.orderDate}
                    </h4>
                    <p className="text-muted-foreground font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-2 text-foreground">{t.total}</h4>
                    <p className="text-primary font-bold text-lg">{order.totalAmount.toLocaleString()} VND</p>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h4 className="font-bold text-xl mb-4">{t.items}</h4>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <Card key={index} className="rounded-lg border-2 overflow-hidden hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={item.productId?.images?.[0] || '/placeholder.svg'}
                              alt={item.productId?.name || 'Product'}
                              className="w-20 h-20 object-cover rounded-lg border-2"
                            />
                            <div className="flex-1">
                              <h5 className="font-bold text-lg mb-1">{item.productId?.name || 'Unknown Product'}</h5>
                              <p className="text-muted-foreground font-medium mb-2">
                                {item.quantity} x {item.price.toLocaleString()} VND
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {item.size && (
                                  <Badge variant="secondary" className="text-xs">{t.items}: {item.size}</Badge>
                                )}
                                {item.color && (
                                  <Badge variant="secondary" className="text-xs">Color: {item.color}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shipping and Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-lg border-2 bg-muted/30">
                    <CardHeader className="pb-4">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {t.shippingAddress}
                      </h4>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm font-medium">
                        <p className="text-foreground">{order.shippingAddress.name}</p>
                        <p className="text-muted-foreground">{order.shippingAddress.address}</p>
                        <p className="text-muted-foreground">{order.shippingAddress.district}, {order.shippingAddress.city}</p>
                        <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-lg border-2 bg-muted/30">
                    <CardHeader className="pb-4">
                      <h4 className="font-bold text-lg">{t.paymentMethod}</h4>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 font-medium">{order.paymentMethod}</p>
                      <Badge
                        variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                        className="text-base px-4 py-2 font-semibold rounded-lg border-2"
                      >
                        {order.paymentStatus === 'paid' ?
                          (language === 'vi' ? 'Đã thanh toán' : language === 'ja' ? '支払い済み' : 'Paid') :
                          (language === 'vi' ? 'Chưa thanh toán' : language === 'ja' ? '未払い' : 'Pending')
                        }
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Order State */}
          {!order && !isLoading && (
            <Card className="max-w-2xl mx-auto rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t.noOrder}</h2>
                <p className="text-muted-foreground font-medium text-lg">{t.noOrderDesc}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>


    </div>
  );
};

export default OrderTrackingPage; 