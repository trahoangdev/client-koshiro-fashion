import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Target,
  Activity,
  Calendar,
  Clock,
  Star,
  Zap,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/currency";

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    trend: number;
  };
  orders: {
    current: number;
    previous: number;
    trend: number;
  };
  users: {
    current: number;
    previous: number;
    trend: number;
  };
  products: {
    current: number;
    previous: number;
    trend: number;
  };
  conversionRate: number;
  customerSatisfaction: number;
  averageOrderValue: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    orders: number;
    users: number;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
}

export default function AdminAnalytics() {
  const { language } = useLanguage();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: { current: 0, previous: 0, trend: 0 },
    orders: { current: 0, previous: 0, trend: 0 },
    users: { current: 0, previous: 0, trend: 0 },
    products: { current: 0, previous: 0, trend: 0 },
    conversionRate: 0,
    customerSatisfaction: 0,
    averageOrderValue: 0,
    monthlyData: [],
    topCategories: []
  });

  const translations = {
    en: {
      title: "Analytics Dashboard",
      subtitle: "Deep insights into your business performance",
      timeRange: "Time Range",
      selectedMetric: "Selected Metric",
      revenue: "Revenue",
      orders: "Orders",
      users: "Users",
      products: "Products",
      conversionRate: "Conversion Rate",
      customerSatisfaction: "Customer Satisfaction",
      averageOrderValue: "Average Order Value",
      trend: "Trend",
      performance: "Performance",
      insights: "Insights",
      topCategories: "Top Categories",
      monthlyTrends: "Monthly Trends",
      realTime: "Real-time",
      export: "Export Data",
      refresh: "Refresh"
    },
    vi: {
      title: "Bảng Phân Tích",
      subtitle: "Thông tin chi tiết về hiệu suất kinh doanh",
      timeRange: "Khoảng Thời Gian",
      selectedMetric: "Chỉ Số Được Chọn",
      revenue: "Doanh Thu",
      orders: "Đơn Hàng",
      users: "Người Dùng",
      products: "Sản Phẩm",
      conversionRate: "Tỷ Lệ Chuyển Đổi",
      customerSatisfaction: "Sự Hài Lòng Khách Hàng",
      averageOrderValue: "Giá Trị Đơn Hàng Trung Bình",
      trend: "Xu Hướng",
      performance: "Hiệu Suất",
      insights: "Thông Tin Chi Tiết",
      topCategories: "Danh Mục Hàng Đầu",
      monthlyTrends: "Xu Hướng Hàng Tháng",
      realTime: "Thời Gian Thực",
      export: "Xuất Dữ Liệu",
      refresh: "Làm Mới"
    },
    ja: {
      title: "分析ダッシュボード",
      subtitle: "ビジネスパフォーマンスの詳細な洞察",
      timeRange: "時間範囲",
      selectedMetric: "選択された指標",
      revenue: "収益",
      orders: "注文",
      users: "ユーザー",
      products: "製品",
      conversionRate: "コンバージョン率",
      customerSatisfaction: "顧客満足度",
      averageOrderValue: "平均注文価値",
      trend: "トレンド",
      performance: "パフォーマンス",
      insights: "洞察",
      topCategories: "トップカテゴリー",
      monthlyTrends: "月次トレンド",
      realTime: "リアルタイム",
      export: "データエクスポート",
      refresh: "更新"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    // Mock data loading - replace with real API calls
    const loadAnalyticsData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalyticsData({
        revenue: { current: 25000000, previous: 22000000, trend: 13.6 },
        orders: { current: 1250, previous: 1100, trend: 13.6 },
        users: { current: 850, previous: 750, trend: 13.3 },
        products: { current: 450, previous: 400, trend: 12.5 },
        conversionRate: 3.2,
        customerSatisfaction: 4.8,
        averageOrderValue: 20000,
        monthlyData: [
          { month: "Jan", revenue: 18000000, orders: 900, users: 600 },
          { month: "Feb", revenue: 20000000, orders: 1000, users: 650 },
          { month: "Mar", revenue: 22000000, orders: 1100, users: 700 },
          { month: "Apr", revenue: 24000000, orders: 1200, users: 750 },
          { month: "May", revenue: 25000000, orders: 1250, users: 800 },
          { month: "Jun", revenue: 25000000, orders: 1250, users: 850 }
        ],
        topCategories: [
          { name: "Kimono", count: 120, revenue: 8000000, percentage: 32 },
          { name: "Haori", count: 95, revenue: 6000000, percentage: 24 },
          { name: "Yukata", count: 85, revenue: 4000000, percentage: 16 },
          { name: "Tops", count: 75, revenue: 3000000, percentage: 12 },
          { name: "Bottoms", count: 65, revenue: 2500000, percentage: 10 }
        ]
      });
    };

    loadAnalyticsData();
  }, [timeRange]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            {t.refresh}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              {t.revenue}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrencyForDisplay(analyticsData.revenue.current)}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              {getTrendIcon(analyticsData.revenue.trend)}
              <span className={`ml-1 ${getTrendColor(analyticsData.revenue.trend)}`}>
                {analyticsData.revenue.trend > 0 ? '+' : ''}{analyticsData.revenue.trend}%
              </span>
              <span className="ml-1">{t.trend}</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              {t.orders}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {analyticsData.orders.current.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              {getTrendIcon(analyticsData.orders.trend)}
              <span className={`ml-1 ${getTrendColor(analyticsData.orders.trend)}`}>
                {analyticsData.orders.trend > 0 ? '+' : ''}{analyticsData.orders.trend}%
              </span>
              <span className="ml-1">{t.trend}</span>
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              {t.users}
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {analyticsData.users.current.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              {getTrendIcon(analyticsData.users.trend)}
              <span className={`ml-1 ${getTrendColor(analyticsData.users.trend)}`}>
                {analyticsData.users.trend > 0 ? '+' : ''}{analyticsData.users.trend}%
              </span>
              <span className="ml-1">{t.trend}</span>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              {t.products}
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {analyticsData.products.current.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-orange-600 mt-1">
              {getTrendIcon(analyticsData.products.trend)}
              <span className={`ml-1 ${getTrendColor(analyticsData.products.trend)}`}>
                {analyticsData.products.trend > 0 ? '+' : ''}{analyticsData.products.trend}%
              </span>
              <span className="ml-1">{t.trend}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t.conversionRate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'vi' ? 'Tỷ lệ chuyển đổi từ khách hàng tiềm năng' :
               language === 'ja' ? '潜在顧客からのコンバージョン率' :
               'Conversion rate from potential customers'}
            </p>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              {t.customerSatisfaction}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.customerSatisfaction}/5.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'vi' ? 'Điểm đánh giá trung bình từ khách hàng' :
               language === 'ja' ? '顧客からの平均評価' :
               'Average customer rating'}
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t.averageOrderValue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrencyForDisplay(analyticsData.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'vi' ? 'Giá trị trung bình mỗi đơn hàng' :
               language === 'ja' ? '注文あたりの平均価値' :
               'Average value per order'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {t.monthlyTrends}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t.monthlyTrends}</p>
                <p className="text-sm">
                  {language === 'vi' ? 'Sẽ được tích hợp với Chart.js' :
                   language === 'ja' ? 'Chart.jsと統合されます' :
                   'Will be integrated with Chart.js'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t.topCategories}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{category.count} products</p>
                    <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
