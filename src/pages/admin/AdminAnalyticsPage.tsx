import { useState, useEffect } from "react";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Activity,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { exportImportService } from "@/lib/exportImportService";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from "recharts";

interface AnalyticsData {
  revenue: {
    total: number;
    trend: number;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
    daily: Array<{ date: string; revenue: number; orders: number }>;
    byCategory: Array<{ category: string; revenue: number; percentage: number }>;
  };
  orders: {
    total: number;
    trend: number;
    byStatus: Array<{ status: string; count: number; percentage: number }>;
    byMonth: Array<{ month: string; orders: number; revenue: number }>;
    byHour: Array<{ hour: string; orders: number }>;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    byCategory: Array<{ category: string; count: number; revenue: number }>;
    topSelling: Array<{ name: string; sales: number; revenue: number; stock: number }>;
    performance: Array<{ name: string; views: number; sales: number; rating: number }>;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
    topSpenders: Array<{ name: string; email: string; totalSpent: number; orders: number }>;
    byLocation: Array<{ location: string; customers: number; revenue: number }>;
    activity: Array<{ date: string; newCustomers: number; activeCustomers: number }>;
  };
  sales: {
    total: number;
    average: number;
    byPaymentMethod: Array<{ method: string; count: number; amount: number }>;
    conversionRate: number;
    cartAbandonment: number;
  };
}

const CHART_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#06B6D4", "#F97316", "#84CC16",
  "#EC4899", "#6366F1", "#14B8A6", "#F43F5E"
];

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    revenue: { total: 0, trend: 0, monthly: [], daily: [], byCategory: [] },
    orders: { total: 0, trend: 0, byStatus: [], byMonth: [], byHour: [] },
    products: { total: 0, active: 0, lowStock: 0, byCategory: [], topSelling: [], performance: [] },
    customers: { total: 0, active: 0, newThisMonth: 0, topSpenders: [], byLocation: [], activity: [] },
    sales: { total: 0, average: 0, byPaymentMethod: [], conversionRate: 0, cartAbandonment: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) {
        navigate("/admin/login");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Load all analytics data from API
        const [
          statsResponse, 
          revenueResponse, 
          productStatsResponse,
          orderAnalyticsResponse,
          customerAnalyticsResponse,
          salesAnalyticsResponse,
          productAnalyticsResponse,
          dailyRevenueResponse
        ] = await Promise.all([
          api.getAdminStats(),
          api.getRevenueData(),
          api.getProductStats(),
          api.getOrderAnalytics(),
          api.getCustomerAnalytics(),
          api.getSalesAnalytics(),
          api.getProductAnalytics(),
          api.getDailyRevenueData(30)
        ]);

        // Transform data for analytics with better data structure
        const analyticsData: AnalyticsData = {
          revenue: {
            total: statsResponse.totalRevenue || 0,
            trend: statsResponse.revenueTrend || 0,
            monthly: revenueResponse || [
              // Fallback data if API returns empty
              { month: 'Jan', revenue: 0, orders: 0 },
              { month: 'Feb', revenue: 0, orders: 0 },
              { month: 'Mar', revenue: 0, orders: 0 },
              { month: 'Apr', revenue: 0, orders: 0 },
              { month: 'May', revenue: 0, orders: 0 },
              { month: 'Jun', revenue: 0, orders: 0 }
            ],
            daily: dailyRevenueResponse || [
              // Fallback daily data
              { date: '2024-01-01', revenue: 0, orders: 0 },
              { date: '2024-01-02', revenue: 0, orders: 0 },
              { date: '2024-01-03', revenue: 0, orders: 0 }
            ],
            byCategory: productStatsResponse?.length > 0 ? productStatsResponse.map(item => ({
              category: item.category || 'Unknown',
              revenue: item.revenue || 0,
              percentage: 0 // Will be calculated below
            })) : [
              // Fallback category data
              { category: 'Kimono', revenue: 0, percentage: 0 },
              { category: 'Yukata', revenue: 0, percentage: 0 },
              { category: 'Accessories', revenue: 0, percentage: 0 }
            ]
          },
          orders: {
            total: statsResponse.totalOrders || 0,
            trend: statsResponse.ordersTrend || 0,
            byStatus: orderAnalyticsResponse?.byStatus || [
              // Fallback order status data
              { status: 'pending', count: 0, percentage: 0 },
              { status: 'processing', count: 0, percentage: 0 },
              { status: 'shipped', count: 0, percentage: 0 },
              { status: 'delivered', count: 0, percentage: 0 },
              { status: 'cancelled', count: 0, percentage: 0 }
            ],
            byMonth: orderAnalyticsResponse?.byMonth || [
              // Fallback monthly order data
              { month: 'Jan', orders: 0, revenue: 0 },
              { month: 'Feb', orders: 0, revenue: 0 },
              { month: 'Mar', orders: 0, revenue: 0 },
              { month: 'Apr', orders: 0, revenue: 0 },
              { month: 'May', orders: 0, revenue: 0 },
              { month: 'Jun', orders: 0, revenue: 0 }
            ],
            byHour: orderAnalyticsResponse?.byHour || [
              // Fallback hourly data
              { hour: '00:00', orders: 0 },
              { hour: '06:00', orders: 0 },
              { hour: '12:00', orders: 0 },
              { hour: '18:00', orders: 0 },
              { hour: '23:00', orders: 0 }
            ]
          },
          products: {
            total: statsResponse.totalProducts || 0,
            active: statsResponse.totalProducts || 0,
            lowStock: productAnalyticsResponse?.lowStock?.length || 0,
            byCategory: productStatsResponse?.length > 0 ? productStatsResponse.map(item => ({
              category: item.category || 'Unknown',
              count: item.count || 0,
              revenue: item.revenue || 0
            })) : [
              // Fallback product category data
              { category: 'Kimono', count: 0, revenue: 0 },
              { category: 'Yukata', count: 0, revenue: 0 },
              { category: 'Accessories', count: 0, revenue: 0 }
            ],
            topSelling: productAnalyticsResponse?.topSelling || [
              // Fallback top selling data
              { name: 'Traditional Kimono', sales: 0, revenue: 0, stock: 0 },
              { name: 'Summer Yukata', sales: 0, revenue: 0, stock: 0 },
              { name: 'Obi Belt', sales: 0, revenue: 0, stock: 0 }
            ],
            performance: productAnalyticsResponse?.performance || [
              // Fallback performance data
              { name: 'Traditional Kimono', views: 0, sales: 0, rating: 0 },
              { name: 'Summer Yukata', views: 0, sales: 0, rating: 0 },
              { name: 'Obi Belt', views: 0, sales: 0, rating: 0 }
            ]
          },
          customers: {
            total: statsResponse.totalUsers || 0,
            active: statsResponse.totalUsers || 0,
            newThisMonth: 0,
            topSpenders: customerAnalyticsResponse?.topSpenders || [
              // Fallback top spenders data
              { name: 'Customer 1', email: 'customer1@example.com', totalSpent: 0, orders: 0 },
              { name: 'Customer 2', email: 'customer2@example.com', totalSpent: 0, orders: 0 },
              { name: 'Customer 3', email: 'customer3@example.com', totalSpent: 0, orders: 0 }
            ],
            byLocation: customerAnalyticsResponse?.byLocation || [
              // Fallback location data
              { location: 'Tokyo', customers: 0, revenue: 0 },
              { location: 'Osaka', customers: 0, revenue: 0 },
              { location: 'Kyoto', customers: 0, revenue: 0 }
            ],
            activity: customerAnalyticsResponse?.activity || [
              // Fallback activity data
              { date: '2024-01-01', newCustomers: 0, activeCustomers: 0 },
              { date: '2024-01-02', newCustomers: 0, activeCustomers: 0 },
              { date: '2024-01-03', newCustomers: 0, activeCustomers: 0 }
            ]
          },
          sales: {
            total: statsResponse.totalRevenue || 0,
            average: salesAnalyticsResponse?.averageOrderValue || 0,
            byPaymentMethod: salesAnalyticsResponse?.byPaymentMethod || [
              // Fallback payment method data
              { method: 'Credit Card', count: 0, amount: 0 },
              { method: 'PayPal', count: 0, amount: 0 },
              { method: 'Bank Transfer', count: 0, amount: 0 }
            ],
            conversionRate: salesAnalyticsResponse?.conversionRate || 0,
            cartAbandonment: salesAnalyticsResponse?.cartAbandonment || 0
          }
        };

        // Calculate percentages for revenue by category
        const totalRevenue = analyticsData.revenue.total;
        if (totalRevenue > 0) {
          analyticsData.revenue.byCategory = analyticsData.revenue.byCategory.map(item => ({
            ...item,
            percentage: Math.round((item.revenue / totalRevenue) * 100)
          }));
        }

        // Calculate percentages for order status
        const totalOrders = analyticsData.orders.total;
        if (totalOrders > 0) {
          analyticsData.orders.byStatus = analyticsData.orders.byStatus.map(item => ({
            ...item,
            percentage: Math.round((item.count / totalOrders) * 100)
          }));
        }

        // Calculate new customers this month from activity data
        if (analyticsData.customers.activity.length > 0) {
          const last30Days = analyticsData.customers.activity.slice(-30);
          analyticsData.customers.newThisMonth = last30Days.reduce((sum, day) => sum + day.newCustomers, 0);
        }

        // Ensure we have at least some data for charts
        if (analyticsData.revenue.monthly.length === 0) {
          analyticsData.revenue.monthly = [
            { month: 'Jan', revenue: 0, orders: 0 },
            { month: 'Feb', revenue: 0, orders: 0 },
            { month: 'Mar', revenue: 0, orders: 0 },
            { month: 'Apr', revenue: 0, orders: 0 },
            { month: 'May', revenue: 0, orders: 0 },
            { month: 'Jun', revenue: 0, orders: 0 }
          ];
        }

        if (analyticsData.orders.byStatus.length === 0) {
          analyticsData.orders.byStatus = [
            { status: 'pending', count: 0, percentage: 0 },
            { status: 'processing', count: 0, percentage: 0 },
            { status: 'shipped', count: 0, percentage: 0 },
            { status: 'delivered', count: 0, percentage: 0 },
            { status: 'cancelled', count: 0, percentage: 0 }
          ];
        }

        setData(analyticsData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" : 
                 language === 'ja' ? "データ読み込みエラー" : 
                 "Error Loading Data",
          description: language === 'vi' ? "Không thể tải dữ liệu phân tích" :
                       language === 'ja' ? "分析データを読み込めませんでした" :
                       "Unable to load analytics data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [toast, language, timeRange]);

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      setIsExporting(true);
      
      // Prepare analytics data for export - flatten complex objects
      const exportData = [
        // Revenue summary
        {
          category: 'Revenue',
          total: data.revenue.total,
          trend: data.revenue.trend,
          timeRange: timeRange,
          generatedAt: new Date().toISOString()
        },
        // Orders summary
        {
          category: 'Orders',
          total: data.orders.total,
          trend: data.orders.trend,
          timeRange: timeRange,
          generatedAt: new Date().toISOString()
        },
        // Products summary
        {
          category: 'Products',
          total: data.products.total,
          active: data.products.active,
          lowStock: data.products.lowStock,
          timeRange: timeRange,
          generatedAt: new Date().toISOString()
        },
        // Customers summary
        {
          category: 'Customers',
          total: data.customers.total,
          active: data.customers.active,
          newThisMonth: data.customers.newThisMonth,
          timeRange: timeRange,
          generatedAt: new Date().toISOString()
        },
        // Sales summary
        {
          category: 'Sales',
          total: data.sales.total,
          average: data.sales.average,
          conversionRate: data.sales.conversionRate,
          cartAbandonment: data.sales.cartAbandonment,
          timeRange: timeRange,
          generatedAt: new Date().toISOString()
        }
      ];

      // Create export job
      const job = await exportImportService.startExportJob('all', format, exportData);
      
      toast({
        title: language === 'vi' ? "Xuất phân tích" : 
               language === 'ja' ? "分析エクスポート" : 
               "Export Analytics",
        description: language === 'vi' ? `Đang xuất dữ liệu phân tích sang ${format.toUpperCase()}...` :
                     language === 'ja' ? `分析データを${format.toUpperCase()}にエクスポート中...` :
                     `Exporting analytics data to ${format.toUpperCase()}...`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getExportJob(job.id);
        if (updatedJob?.status === 'completed' && updatedJob.downloadUrl) {
          // Trigger download
          const link = document.createElement('a');
          link.href = updatedJob.downloadUrl;
          const extension = format === 'excel' ? 'xls' : format;
          link.download = `analytics_export_${new Date().toISOString().split('T')[0]}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(updatedJob.downloadUrl);
          
          toast({
            title: language === 'vi' ? "Xuất thành công" : 
                   language === 'ja' ? "エクスポート成功" : 
                   "Export Successful",
            description: language === 'vi' ? `Dữ liệu phân tích đã được xuất sang ${format.toUpperCase()}` :
                         language === 'ja' ? `分析データが${format.toUpperCase()}にエクスポートされました` :
                         `Analytics data exported to ${format.toUpperCase()}`,
          });
          setIsExporting(false);
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: language === 'vi' ? "Xuất thất bại" : 
                   language === 'ja' ? "エクスポート失敗" : 
                   "Export Failed",
            description: updatedJob.error || (language === 'vi' ? "Không thể xuất dữ liệu phân tích" :
                         language === 'ja' ? "分析データをエクスポートできませんでした" :
                         "Failed to export analytics data"),
            variant: "destructive",
          });
          setIsExporting(false);
        } else {
          setTimeout(checkJob, 500);
        }
      };
      
      checkJob();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: language === 'vi' ? "Lỗi xuất dữ liệu" : 
               language === 'ja' ? "エクスポートエラー" : 
               "Export Error",
        description: language === 'vi' ? "Không thể xuất dữ liệu phân tích" :
                     language === 'ja' ? "分析データをエクスポートできませんでした" :
                     "Failed to export analytics data",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatChartValue = (value: number, type: 'currency' | 'number' | 'percentage' = 'number') => {
    switch (type) {
      case 'currency':
        return formatCurrency(value, language);
      case 'percentage':
        return `${value}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getChartColors = (dataLength: number) => {
    const colors = [
      "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
      "#8B5CF6", "#06B6D4", "#F97316", "#84CC16",
      "#EC4899", "#6366F1", "#14B8A6", "#F43F5E"
    ];
    
    // Ensure we have enough colors for the data
    while (colors.length < dataLength) {
      colors.push(...colors);
    }
    
    return colors.slice(0, dataLength);
  };

  const translations = {
    en: {
      title: "Analytics Dashboard",
      subtitle: "Detailed insights into your business performance",
      revenue: "Revenue",
      orders: "Orders",
      products: "Products",
      customers: "Customers",
      overview: "Overview",
      detailed: "Detailed Analysis",
      export: "Export Data",
      refresh: "Refresh",
      timeRange: "Time Range",
      totalRevenue: "Total Revenue",
      totalOrders: "Total Orders",
      totalProducts: "Total Products",
      totalCustomers: "Total Customers",
      activeProducts: "Active Products",
      lowStockProducts: "Low Stock Products",
      activeCustomers: "Active Customers",
      newCustomers: "New This Month",
      topSpenders: "Top Spenders",
      orderStatus: "Order Status",
      productCategories: "Product Categories",
      monthlyRevenue: "Monthly Revenue",
      customerActivity: "Customer Activity",
      loading: "Loading analytics data...",
      noData: "No data available",
      revenueTrend: "Revenue Trend",
      orderAnalytics: "Order Analytics",
      customerBehavior: "Customer Behavior",
      productPerformance: "Product Performance",
      salesAnalytics: "Sales Analytics",
      conversionRate: "Conversion Rate",
      cartAbandonment: "Cart Abandonment",
      averageOrderValue: "Average Order Value",
      paymentMethods: "Payment Methods",
      customerLocations: "Customer Locations",
      topProducts: "Top Selling Products",
      productViews: "Product Views vs Sales",
      hourlyOrders: "Orders by Hour",
      dailyActivity: "Daily Customer Activity"
    },
    vi: {
      title: "Bảng Phân Tích",
      subtitle: "Thông tin chi tiết về hiệu suất kinh doanh",
      revenue: "Doanh Thu",
      orders: "Đơn Hàng",
      products: "Sản Phẩm",
      customers: "Khách Hàng",
      overview: "Tổng Quan",
      detailed: "Phân Tích Chi Tiết",
      export: "Xuất Dữ Liệu",
      refresh: "Làm Mới",
      timeRange: "Khoảng Thời Gian",
      totalRevenue: "Tổng Doanh Thu",
      totalOrders: "Tổng Đơn Hàng",
      totalProducts: "Tổng Sản Phẩm",
      totalCustomers: "Tổng Khách Hàng",
      activeProducts: "Sản Phẩm Hoạt Động",
      lowStockProducts: "Sản Phẩm Sắp Hết",
      activeCustomers: "Khách Hàng Hoạt Động",
      newCustomers: "Mới Tháng Này",
      topSpenders: "Khách Hàng Chi Tiêu Cao",
      orderStatus: "Trạng Thái Đơn Hàng",
      productCategories: "Danh Mục Sản Phẩm",
      monthlyRevenue: "Doanh Thu Hàng Tháng",
      customerActivity: "Hoạt Động Khách Hàng",
      loading: "Đang tải dữ liệu phân tích...",
      noData: "Không có dữ liệu",
      revenueTrend: "Xu Hướng Doanh Thu",
      orderAnalytics: "Phân Tích Đơn Hàng",
      customerBehavior: "Hành Vi Khách Hàng",
      productPerformance: "Hiệu Suất Sản Phẩm",
      salesAnalytics: "Phân Tích Bán Hàng",
      conversionRate: "Tỷ Lệ Chuyển Đổi",
      cartAbandonment: "Tỷ Lệ Bỏ Giỏ Hàng",
      averageOrderValue: "Giá Trị Đơn Hàng Trung Bình",
      paymentMethods: "Phương Thức Thanh Toán",
      customerLocations: "Vị Trí Khách Hàng",
      topProducts: "Sản Phẩm Bán Chạy",
      productViews: "Lượt Xem vs Bán Hàng",
      hourlyOrders: "Đơn Hàng Theo Giờ",
      dailyActivity: "Hoạt Động Khách Hàng Hàng Ngày"
    },
    ja: {
      title: "分析ダッシュボード",
      subtitle: "ビジネスパフォーマンスの詳細な洞察",
      revenue: "売上",
      orders: "注文",
      products: "商品",
      customers: "顧客",
      overview: "概要",
      detailed: "詳細分析",
      export: "データエクスポート",
      refresh: "更新",
      timeRange: "期間",
      totalRevenue: "総売上",
      totalOrders: "総注文数",
      totalProducts: "総商品数",
      totalCustomers: "総顧客数",
      activeProducts: "アクティブ商品",
      lowStockProducts: "在庫不足商品",
      activeCustomers: "アクティブ顧客",
      newCustomers: "今月の新規",
      topSpenders: "高額顧客",
      orderStatus: "注文ステータス",
      productCategories: "商品カテゴリ",
      monthlyRevenue: "月次売上",
      customerActivity: "顧客アクティビティ",
      loading: "分析データを読み込み中...",
      noData: "データがありません",
      revenueTrend: "売上トレンド",
      orderAnalytics: "注文分析",
      customerBehavior: "顧客行動",
      productPerformance: "商品パフォーマンス",
      salesAnalytics: "売上分析",
      conversionRate: "コンバージョン率",
      cartAbandonment: "カート放棄率",
      averageOrderValue: "平均注文価値",
      paymentMethods: "支払い方法",
      customerLocations: "顧客所在地",
      topProducts: "人気商品",
      productViews: "商品閲覧 vs 売上",
      hourlyOrders: "時間別注文",
      dailyActivity: "日次顧客アクティビティ"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t.loading}</p>
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : t.export}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.revenue.total, language)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(data.revenue.trend)}
                <span className={`ml-1 ${getTrendColor(data.revenue.trend)}`}>
                  {Math.abs(data.revenue.trend)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalOrders}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.orders.total.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(data.orders.trend)}
                <span className={`ml-1 ${getTrendColor(data.orders.trend)}`}>
                  {Math.abs(data.orders.trend)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.products.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {data.products.active} {t.activeProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalCustomers}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.customers.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {data.customers.active} {t.activeCustomers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="detailed">{t.detailed}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Revenue Trend Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {t.revenueTrend}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.revenue.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickFormatter={(value) => formatCurrency(value, language)}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value: number) => [formatCurrency(value, language), 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                        name="Revenue"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Order Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {t.orderStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={data.orders.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) => `${status} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.orders.byStatus.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getChartColors(data.orders.byStatus.length)[index]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(), 
                          name === 'count' ? 'Orders' : name
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Product Categories Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    {t.productCategories}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.products.byCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value: number) => [value.toLocaleString(), 'Products']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#10B981" 
                        name="Products"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Spenders */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {t.topSpenders}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.customers.topSpenders.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(customer.totalSpent, language)}</div>
                          <div className="text-sm text-muted-foreground">{customer.orders} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Revenue by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.revenueTrend}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.revenue.byCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickFormatter={(value) => formatCurrency(value, language)}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value: number) => [formatCurrency(value, language), 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#8B5CF6" 
                        name="Revenue"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders by Hour */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.hourlyOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.orders.byHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value: number) => [value.toLocaleString(), 'Orders']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.dailyActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data.customers.activity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(), 
                          name === 'newCustomers' ? 'New Customers' : 'Active Customers'
                        ]}
                      />
                      <Bar 
                        dataKey="newCustomers" 
                        fill="#EF4444" 
                        name="New Customers"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="activeCustomers" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        name="Active Customers"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.paymentMethods}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={data.sales.byPaymentMethod}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, amount }) => `${method} ${formatCurrency(amount, language)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {data.sales.byPaymentMethod.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getChartColors(data.sales.byPaymentMethod.length)[index]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value, language), 
                          name === 'amount' ? 'Amount' : name
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Product Performance Section */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Performance Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(data.sales.average, language)}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Average Order Value
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {data.sales.conversionRate}%
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Conversion Rate
                      </div>
                    </div>
                  </div>

                  {/* Revenue Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Monthly Revenue</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(data.revenue.monthly.reduce((sum, item) => sum + item.revenue, 0), language)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Weekly Revenue</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(data.revenue.daily.slice(-7).reduce((sum, item) => sum + item.revenue, 0), language)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Daily Revenue</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(data.revenue.daily[data.revenue.daily.length - 1]?.revenue || 0, language)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Metrics */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t.salesAnalytics}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{data.sales.conversionRate}%</div>
                      <div className="text-sm text-muted-foreground">{t.conversionRate}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{data.sales.cartAbandonment}%</div>
                      <div className="text-sm text-muted-foreground">{t.cartAbandonment}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.sales.average, language)}</div>
                      <div className="text-sm text-muted-foreground">{t.averageOrderValue}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
