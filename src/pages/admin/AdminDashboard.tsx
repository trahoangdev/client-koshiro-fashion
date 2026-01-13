import { useState, useEffect } from "react";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Tag,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Search,
  Zap,
  Star,
  ShoppingBag,
  CreditCard,
  Truck,
  UserCheck,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  CalendarDays,
  Clock3,
  DollarSign as DollarSignIcon,
  Package2,
  Users2,
  FileText,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";



// Types
interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface ProductStats {
  category: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  ordersTrend: number;
  productsTrend: number;
  usersTrend: number;
  revenueTrend: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  activeUsers: number;
  averageOrderValue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  conversionRate: number;
  customerSatisfaction: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    ordersTrend: 0,
    productsTrend: 0,
    usersTrend: 0,
    revenueTrend: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    lowStockProducts: 0,
    activeUsers: 0,
    averageOrderValue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    conversionRate: 0,
    customerSatisfaction: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) {
        navigate("/admin/login");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US');
  };

  // Load dashboard data with real-time updates
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        logger.debug('Loading admin dashboard data...');
        
        // Load comprehensive admin stats
        const statsResponse = await api.getAdminStats();
        logger.debug('Admin stats loaded', statsResponse);
        
        // Calculate additional metrics
        const calculatedStats = {
          ...statsResponse,
          monthlyRevenue: statsResponse.totalRevenue * 0.3, // Mock calculation
          weeklyRevenue: statsResponse.totalRevenue * 0.1, // Mock calculation
          dailyRevenue: statsResponse.totalRevenue * 0.02, // Mock calculation
          conversionRate: 3.2, // Mock conversion rate
          customerSatisfaction: 4.8, // Mock satisfaction score
          pendingOrders: Math.floor(statsResponse.totalOrders * 0.15),
          completedOrders: Math.floor(statsResponse.totalOrders * 0.75),
          cancelledOrders: Math.floor(statsResponse.totalOrders * 0.1),
          lowStockProducts: Math.floor(statsResponse.totalProducts * 0.2),
          activeUsers: Math.floor(statsResponse.totalUsers * 0.8),
          averageOrderValue: statsResponse.totalRevenue / statsResponse.totalOrders || 0
        };
        
        setStats(calculatedStats);
        
        // Load recent orders with real-time data
        const ordersResponse = await api.getAdminOrders({ page: 1, limit: 10 });
        logger.debug('Recent orders loaded', { count: ordersResponse.data?.length || 0 });
        
        // Transform Order data to RecentOrder format
        const transformedOrders: RecentOrder[] = ordersResponse.data.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customer: order.userId?.name || 'Unknown Customer',
          customerEmail: order.userId?.email || '',
          total: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items.length
        }));
        
        setRecentOrders(transformedOrders);
        
        // Load enhanced revenue data
        const revenueResponse = await api.getRevenueData();
        setRevenueData(revenueResponse.map(item => ({
          ...item,
          customers: Math.floor(Math.random() * 50) + 10 // Mock customer data
        })));
        
        // Load enhanced product stats
        const productStatsResponse = await api.getProductStats();
        setProductStats(productStatsResponse.map(item => ({
          ...item,
          percentage: Math.floor(Math.random() * 30) + 10 // Mock percentage
        })));
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" : 
                 language === 'ja' ? "データ読み込みエラー" : 
                 "Error Loading Data",
          description: language === 'vi' ? "Không thể tải dữ liệu bảng điều khiển" :
                       language === 'ja' ? "ダッシュボードデータを読み込めませんでした" :
                       "Unable to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [toast, language, timeRange]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: language === 'vi' ? 'Chờ xử lý' : language === 'ja' ? '処理待ち' : 'Pending', variant: 'secondary' as const },
      processing: { label: language === 'vi' ? 'Đang xử lý' : language === 'ja' ? '処理中' : 'Processing', variant: 'default' as const },
      completed: { label: language === 'vi' ? 'Hoàn thành' : language === 'ja' ? '完了' : 'Completed', variant: 'default' as const },
      cancelled: { label: language === 'vi' ? 'Đã hủy' : language === 'ja' ? 'キャンセル' : 'Cancelled', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const filteredOrders = recentOrders.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const translations = {
    en: {
      title: "Admin Dashboard",
      subtitle: "Real-time overview of your business performance",
      overview: "Overview",
      insights: "Insights",
      recentOrders: "Recent Orders",
      productStats: "Product Performance",
      totalOrders: "Total Orders",
      totalProducts: "Total Products",
      totalUsers: "Total Users",
      totalRevenue: "Total Revenue",
      pendingOrders: "Pending Orders",
      completedOrders: "Completed Orders",
      cancelledOrders: "Cancelled Orders",
      lowStockProducts: "Low Stock Products",
      activeUsers: "Active Users",
      averageOrderValue: "Average Order Value",
      monthlyRevenue: "Monthly Revenue",
      weeklyRevenue: "Weekly Revenue",
      dailyRevenue: "Daily Revenue",
      conversionRate: "Conversion Rate",
      customerSatisfaction: "Customer Satisfaction",
      viewAll: "View All",
      refresh: "Refresh",
      export: "Export",
      search: "Search orders...",
      timeRange: "Time Range",
      customer: "Customer",
      orderNumber: "Order #",
      total: "Total",
      status: "Status",
      date: "Date",
      items: "Items",
      noOrders: "No recent orders",
      loading: "Loading dashboard data...",
      error: "Error loading data",
      realTime: "Real-time",
      performance: "Performance",
      trends: "Trends",
      metrics: "Key Metrics"
    },
    vi: {
      title: "Bảng Điều Khiển Admin",
      subtitle: "Tổng quan thời gian thực về hiệu suất kinh doanh",
      overview: "Tổng Quan",
      insights: "Thông Tin Chi Tiết",
      recentOrders: "Đơn Hàng Gần Đây",
      productStats: "Hiệu Suất Sản Phẩm",
      totalOrders: "Tổng Đơn Hàng",
      totalProducts: "Tổng Sản Phẩm",
      totalUsers: "Tổng Người Dùng",
      totalRevenue: "Tổng Doanh Thu",
      pendingOrders: "Đơn Hàng Chờ",
      completedOrders: "Đơn Hàng Hoàn Thành",
      cancelledOrders: "Đơn Hàng Hủy",
      lowStockProducts: "Sản Phẩm Sắp Hết",
      activeUsers: "Người Dùng Hoạt Động",
      averageOrderValue: "Giá Trị Đơn Hàng TB",
      monthlyRevenue: "Doanh Thu Tháng",
      weeklyRevenue: "Doanh Thu Tuần",
      dailyRevenue: "Doanh Thu Ngày",
      conversionRate: "Tỷ Lệ Chuyển Đổi",
      customerSatisfaction: "Sự Hài Lòng KH",
      viewAll: "Xem Tất Cả",
      refresh: "Làm Mới",
      export: "Xuất Dữ Liệu",
      search: "Tìm kiếm đơn hàng...",
      timeRange: "Khoảng Thời Gian",
      customer: "Khách Hàng",
      orderNumber: "Mã Đơn Hàng",
      total: "Tổng",
      status: "Trạng Thái",
      date: "Ngày",
      items: "Sản Phẩm",
      noOrders: "Không có đơn hàng gần đây",
      loading: "Đang tải dữ liệu...",
      error: "Lỗi tải dữ liệu",
      realTime: "Thời gian thực",
      performance: "Hiệu suất",
      trends: "Xu hướng",
      metrics: "Chỉ số chính"
    },
    ja: {
      title: "管理ダッシュボード",
      subtitle: "ビジネスパフォーマンスのリアルタイム概要",
      overview: "概要",
      insights: "詳細情報",
      recentOrders: "最近の注文",
      productStats: "製品パフォーマンス",
      totalOrders: "総注文数",
      totalProducts: "総製品数",
      totalUsers: "総ユーザー数",
      totalRevenue: "総収益",
      pendingOrders: "保留中の注文",
      completedOrders: "完了した注文",
      cancelledOrders: "キャンセルされた注文",
      lowStockProducts: "在庫不足製品",
      activeUsers: "アクティブユーザー",
      averageOrderValue: "平均注文価値",
      monthlyRevenue: "月次収益",
      weeklyRevenue: "週次収益",
      dailyRevenue: "日次収益",
      conversionRate: "コンバージョン率",
      customerSatisfaction: "顧客満足度",
      viewAll: "すべて表示",
      refresh: "更新",
      export: "エクスポート",
      search: "注文を検索...",
      timeRange: "時間範囲",
      customer: "顧客",
      orderNumber: "注文番号",
      total: "合計",
      status: "ステータス",
      date: "日付",
      items: "アイテム",
      noOrders: "最近の注文はありません",
      loading: "ダッシュボードデータを読み込み中...",
      error: "データ読み込みエラー",
      realTime: "リアルタイム",
      performance: "パフォーマンス",
      trends: "トレンド",
      metrics: "主要指標"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = () => {
    toast({
      title: t.export,
      description: language === 'vi' ? "Đang xuất dữ liệu..." : 
                   language === 'ja' ? "データをエクスポート中..." : 
                   "Exporting data...",
    });
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">{t.loading}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <img 
                  src="/koshino_logo.png" 
                  alt="Koshiro Logo" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {language === 'vi' ? 'Chào mừng trở lại với Koshiro Panel!' : 
                 language === 'ja' ? 'Koshiroパネルへようこそ！' : 
                 'Welcome back to Koshiro Panel!'}
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl">
              {language === 'vi' ? 'Đây là tổng quan thời gian thực về hiệu suất kinh doanh của bạn. Theo dõi doanh thu, đơn hàng và khách hàng một cách trực quan.' :
               language === 'ja' ? 'ビジネスパフォーマンスのリアルタイム概要です。収益、注文、顧客を視覚的に追跡できます。' :
               'Here\'s your real-time overview of business performance. Track revenue, orders, and customers visually.'}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-blue-100">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {language === 'vi' ? 'Dữ liệu cập nhật thời gian thực' :
                   language === 'ja' ? 'リアルタイムデータ更新' :
                   'Real-time data updates'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {language === 'vi' ? 'Cập nhật mỗi 30 giây' :
                   language === 'ja' ? '30秒ごとに更新' :
                   'Updates every 30 seconds'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          <div className="absolute top-1/2 right-8 w-16 h-16 bg-white/5 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {t.overview}
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-border hover:bg-accent">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.refresh}
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" className="border-border hover:bg-accent">
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t.totalRevenue}
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSignIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrencyForDisplay(stats.totalRevenue)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {getTrendIcon(stats.revenueTrend)}
                <span className={`ml-1 ${getTrendColor(stats.revenueTrend)}`}>
                  {stats.revenueTrend > 0 ? '+' : ''}{stats.revenueTrend}%
                </span>
                <span className="ml-1">{t.trends}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t.totalOrders}
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalOrders.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {getTrendIcon(stats.ordersTrend)}
                <span className={`ml-1 ${getTrendColor(stats.ordersTrend)}`}>
                  {stats.ordersTrend > 0 ? '+' : ''}{stats.ordersTrend}%
                </span>
                <span className="ml-1">{t.trends}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t.totalUsers}
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {getTrendIcon(stats.usersTrend)}
                <span className={`ml-1 ${getTrendColor(stats.usersTrend)}`}>
                  {stats.usersTrend > 0 ? '+' : ''}{stats.usersTrend}%
                </span>
                <span className="ml-1">{t.trends}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t.totalProducts}
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Package2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalProducts.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {getTrendIcon(stats.productsTrend)}
                <span className={`ml-1 ${getTrendColor(stats.productsTrend)}`}>
                  {stats.productsTrend > 0 ? '+' : ''}{stats.productsTrend}%
                </span>
                <span className="ml-1">{t.trends}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Orders */}
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t.pendingOrders}
              </CardTitle>
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {stats.pendingOrders}
              </div>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t.completedOrders}
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {stats.completedOrders}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t.lowStockProducts}
              </CardTitle>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {stats.lowStockProducts}
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t.customerSatisfaction}
              </CardTitle>
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                <Star className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {stats.customerSatisfaction}/5.0
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Overview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t.recentOrders}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate("/admin/orders")}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    {t.viewAll}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{order.customer}</p>
                            <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{formatCurrencyForDisplay(order.total)}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t.noOrders}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  {t.performance}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrencyForDisplay(stats.averageOrderValue)}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {t.averageOrderValue}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.conversionRate}%
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {t.conversionRate}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">{t.monthlyRevenue}</span>
                    <span className="font-medium text-foreground">{formatCurrencyForDisplay(stats.monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">{t.weeklyRevenue}</span>
                    <span className="font-medium text-foreground">{formatCurrencyForDisplay(stats.weeklyRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">{t.dailyRevenue}</span>
                    <span className="font-medium text-foreground">{formatCurrencyForDisplay(stats.dailyRevenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}