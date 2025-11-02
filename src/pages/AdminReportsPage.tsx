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
  FileText,
  Download as DownloadIcon,
  Printer,
  Mail,
  Share2,
  AlertCircle,
  XCircle
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
import AdminLayout from "@/components/AdminLayout";
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
  ComposedChart
} from "recharts";

interface ReportData {
  sales: {
    total: number;
    trend: number;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
    topProducts: Array<{ name: string; revenue: number; quantity: number }>;
  };
  customers: {
    total: number;
    new: number;
    active: number;
    topSpenders: Array<{ name: string; email: string; totalSpent: number; orders: number }>;
    growth: Array<{ month: string; newCustomers: number; totalCustomers: number }>;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
    byCategory: Array<{ category: string; count: number; value: number }>;
    status: Array<{ status: string; count: number; percentage: number }>;
  };
  performance: {
    conversionRate: number;
    averageOrderValue: number;
    customerRetention: number;
    topCategories: Array<{ category: string; revenue: number; percentage: number }>;
    metrics: Array<{ metric: string; value: number; target: number }>;
  };
}

const CHART_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#06B6D4", "#F97316", "#84CC16",
  "#EC4899", "#6366F1", "#14B8A6", "#F43F5E"
];

export default function AdminReportsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<ReportData>({
    sales: { total: 0, trend: 0, monthly: [], topProducts: [] },
    customers: { total: 0, new: 0, active: 0, topSpenders: [], growth: [] },
    inventory: { total: 0, lowStock: 0, outOfStock: 0, byCategory: [], status: [] },
    performance: { conversionRate: 0, averageOrderValue: 0, customerRetention: 0, topCategories: [], metrics: [] }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [reportType, setReportType] = useState("sales");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) {
        navigate("/admin/login");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      
      // Load data from API
      const [statsResponse, revenueResponse, productStatsResponse, orderAnalyticsResponse, customerAnalyticsResponse] = await Promise.all([
        api.getAdminStats(),
        api.getRevenueData(),
        api.getProductStats(),
        api.getOrderAnalytics(),
        api.getCustomerAnalytics()
      ]);

      // Transform data for reports
      const reportData: ReportData = {
        sales: {
          total: statsResponse.totalRevenue || 0,
          trend: statsResponse.revenueTrend || 0,
          monthly: revenueResponse || [
            { month: 'Jan', revenue: 0, orders: 0 },
            { month: 'Feb', revenue: 0, orders: 0 },
            { month: 'Mar', revenue: 0, orders: 0 },
            { month: 'Apr', revenue: 0, orders: 0 },
            { month: 'May', revenue: 0, orders: 0 },
            { month: 'Jun', revenue: 0, orders: 0 }
          ],
          topProducts: [
            { name: "Kimono Traditional", revenue: 2500000, quantity: 15 },
            { name: "Yukata Summer", revenue: 1800000, quantity: 12 },
            { name: "Hakama Formal", revenue: 1200000, quantity: 8 },
            { name: "Obi Belt", revenue: 800000, quantity: 25 },
            { name: "Geta Sandals", revenue: 600000, quantity: 30 }
          ]
        },
        customers: {
          total: statsResponse.totalUsers || 0,
          new: Math.floor((statsResponse.totalUsers || 0) * 0.15),
          active: Math.floor((statsResponse.totalUsers || 0) * 0.7),
          topSpenders: [
            { name: "Nguyễn Văn A", email: "nguyenvana@email.com", totalSpent: 5000000, orders: 5 },
            { name: "Trần Thị B", email: "tranthib@email.com", totalSpent: 3500000, orders: 3 },
            { name: "Lê Văn C", email: "levanc@email.com", totalSpent: 2800000, orders: 4 },
            { name: "Phạm Thị D", email: "phamthid@email.com", totalSpent: 2200000, orders: 2 },
            { name: "Hoàng Văn E", email: "hoangvane@email.com", totalSpent: 1800000, orders: 3 }
          ],
          growth: customerAnalyticsResponse?.activity ? customerAnalyticsResponse.activity.map(item => ({
            month: item.date,
            newCustomers: item.newCustomers,
            totalCustomers: item.activeCustomers
          })) : [
            { month: 'Jan', newCustomers: 15, totalCustomers: 100 },
            { month: 'Feb', newCustomers: 20, totalCustomers: 120 },
            { month: 'Mar', newCustomers: 18, totalCustomers: 138 },
            { month: 'Apr', newCustomers: 25, totalCustomers: 163 },
            { month: 'May', newCustomers: 22, totalCustomers: 185 },
            { month: 'Jun', newCustomers: 30, totalCustomers: 215 }
          ]
        },
        inventory: {
          total: statsResponse.totalProducts || 0,
          lowStock: 5,
          outOfStock: 2,
          byCategory: productStatsResponse?.length > 0 ? productStatsResponse.map(item => ({
            category: item.category || 'Unknown',
            count: item.count || 0,
            value: item.revenue || 0
          })) : [
            { category: 'Kimono', count: 25, value: 5000000 },
            { category: 'Yukata', count: 20, value: 3000000 },
            { category: 'Accessories', count: 35, value: 2000000 },
            { category: 'Footwear', count: 15, value: 1500000 }
          ],
          status: [
            { status: 'In Stock', count: (statsResponse.totalProducts || 0) - 7, percentage: 85 },
            { status: 'Low Stock', count: 5, percentage: 10 },
            { status: 'Out of Stock', count: 2, percentage: 5 }
          ]
        },
        performance: {
          conversionRate: 3.2,
          averageOrderValue: statsResponse.totalRevenue > 0 && statsResponse.totalOrders > 0 
            ? statsResponse.totalRevenue / statsResponse.totalOrders 
            : 850000,
          customerRetention: 78.5,
          topCategories: [
            { category: "Kimono", revenue: 3500000, percentage: 35 },
            { category: "Yukata", revenue: 2500000, percentage: 25 },
            { category: "Accessories", revenue: 2000000, percentage: 20 },
            { category: "Footwear", revenue: 1500000, percentage: 15 },
            { category: "Others", revenue: 500000, percentage: 5 }
          ],
          metrics: [
            { metric: 'Conversion Rate', value: 3.2, target: 5.0 },
            { metric: 'Average Order Value', value: 850000, target: 1000000 },
            { metric: 'Customer Retention', value: 78.5, target: 80.0 },
            { metric: 'Revenue Growth', value: 12.5, target: 15.0 }
          ]
        }
      };

      setData(reportData);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: language === 'vi' ? "Lỗi tải dữ liệu" : 
               language === 'ja' ? "データ読み込みエラー" : 
               "Error Loading Data",
        description: language === 'vi' ? "Không thể tải dữ liệu báo cáo" :
                     language === 'ja' ? "レポートデータを読み込めませんでした" :
                     "Unable to load report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      setIsExporting(true);
      
      // Prepare report data for export - flatten complex objects
      const exportData = [
        // Sales summary
        {
          category: 'Sales',
          total: data.sales.total,
          trend: data.sales.trend,
          timeRange: timeRange,
          reportType: reportType,
          generatedAt: new Date().toISOString()
        },
        // Customers summary
        {
          category: 'Customers',
          total: data.customers.total,
          new: data.customers.new,
          active: data.customers.active,
          timeRange: timeRange,
          reportType: reportType,
          generatedAt: new Date().toISOString()
        },
        // Inventory summary
        {
          category: 'Inventory',
          total: data.inventory.total,
          lowStock: data.inventory.lowStock,
          outOfStock: data.inventory.outOfStock,
          timeRange: timeRange,
          reportType: reportType,
          generatedAt: new Date().toISOString()
        },
        // Performance summary
        {
          category: 'Performance',
          conversionRate: data.performance.conversionRate,
          averageOrderValue: data.performance.averageOrderValue,
          customerRetention: data.performance.customerRetention,
          timeRange: timeRange,
          reportType: reportType,
          generatedAt: new Date().toISOString()
        }
      ];

      // Create export job
      const job = await exportImportService.startExportJob('all', format, exportData);
      
      toast({
        title: language === 'vi' ? "Xuất báo cáo" : 
               language === 'ja' ? "レポートエクスポート" : 
               "Export Report",
        description: language === 'vi' ? `Đang xuất báo cáo sang ${format.toUpperCase()}...` :
                     language === 'ja' ? `レポートを${format.toUpperCase()}にエクスポート中...` :
                     `Exporting report to ${format.toUpperCase()}...`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getExportJob(job.id);
        if (updatedJob?.status === 'completed' && updatedJob.downloadUrl) {
          // Trigger download
          const link = document.createElement('a');
          link.href = updatedJob.downloadUrl;
          const extension = format === 'excel' ? 'xlsx' : format;
          link.download = `reports_export_${new Date().toISOString().split('T')[0]}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(updatedJob.downloadUrl);
          
          toast({
            title: language === 'vi' ? "Xuất thành công" : 
                   language === 'ja' ? "エクスポート成功" : 
                   "Export Successful",
            description: language === 'vi' ? `Báo cáo đã được xuất sang ${format.toUpperCase()}` :
                         language === 'ja' ? `レポートが${format.toUpperCase()}にエクスポートされました` :
                         `Report exported to ${format.toUpperCase()}`,
          });
          setIsExporting(false);
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: language === 'vi' ? "Xuất thất bại" : 
                   language === 'ja' ? "エクスポート失敗" : 
                   "Export Failed",
            description: updatedJob.error || (language === 'vi' ? "Không thể xuất báo cáo" :
                         language === 'ja' ? "レポートをエクスポートできませんでした" :
                         "Failed to export report"),
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
        title: language === 'vi' ? "Lỗi xuất báo cáo" : 
               language === 'ja' ? "エクスポートエラー" : 
               "Export Error",
        description: language === 'vi' ? "Không thể xuất báo cáo" :
                     language === 'ja' ? "レポートをエクスポートできませんでした" :
                     "Failed to export report",
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

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name?: string;
      value?: number;
      color?: string;
    }>;
    label?: string | number;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload?.map((entry, index: number) => (
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

  const translations = {
    en: {
      title: "Reports & Analytics",
      subtitle: "Comprehensive business insights and performance metrics",
      sales: "Sales",
      customers: "Customers",
      inventory: "Inventory",
      performance: "Performance",
      export: "Export Report",
      refresh: "Refresh",
      timeRange: "Time Range",
      totalRevenue: "Total Revenue",
      totalOrders: "Total Orders",
      totalCustomers: "Total Customers",
      totalProducts: "Total Products",
      newCustomers: "New Customers",
      activeCustomers: "Active Customers",
      lowStockProducts: "Low Stock Products",
      outOfStockProducts: "Out of Stock Products",
      conversionRate: "Conversion Rate",
      averageOrderValue: "Average Order Value",
      customerRetention: "Customer Retention",
      topProducts: "Top Products",
      topSpenders: "Top Spenders",
      topCategories: "Top Categories",
      monthlyRevenue: "Monthly Revenue",
      customerGrowth: "Customer Growth",
      inventoryStatus: "Inventory Status",
      performanceMetrics: "Performance Metrics",
      loading: "Loading report data...",
      noData: "No data available"
    },
    vi: {
      title: "Báo Cáo & Phân Tích",
      subtitle: "Thông tin chi tiết về kinh doanh và chỉ số hiệu suất",
      sales: "Bán Hàng",
      customers: "Khách Hàng",
      inventory: "Tồn Kho",
      performance: "Hiệu Suất",
      export: "Xuất Báo Cáo",
      refresh: "Làm Mới",
      timeRange: "Khoảng Thời Gian",
      totalRevenue: "Tổng Doanh Thu",
      totalOrders: "Tổng Đơn Hàng",
      totalCustomers: "Tổng Khách Hàng",
      totalProducts: "Tổng Sản Phẩm",
      newCustomers: "Khách Hàng Mới",
      activeCustomers: "Khách Hàng Hoạt Động",
      lowStockProducts: "Sản Phẩm Sắp Hết",
      outOfStockProducts: "Sản Phẩm Hết Hàng",
      conversionRate: "Tỷ Lệ Chuyển Đổi",
      averageOrderValue: "Giá Trị Đơn Hàng TB",
      customerRetention: "Tỷ Lệ Giữ Chân",
      topProducts: "Sản Phẩm Bán Chạy",
      topSpenders: "Khách Hàng Chi Tiêu Cao",
      topCategories: "Danh Mục Hàng Đầu",
      monthlyRevenue: "Doanh Thu Hàng Tháng",
      customerGrowth: "Tăng Trưởng Khách Hàng",
      inventoryStatus: "Trạng Thái Tồn Kho",
      performanceMetrics: "Chỉ Số Hiệu Suất",
      loading: "Đang tải dữ liệu báo cáo...",
      noData: "Không có dữ liệu"
    },
    ja: {
      title: "レポート・分析",
      subtitle: "包括的なビジネス洞察とパフォーマンス指標",
      sales: "売上",
      customers: "顧客",
      inventory: "在庫",
      performance: "パフォーマンス",
      export: "レポートエクスポート",
      refresh: "更新",
      timeRange: "期間",
      totalRevenue: "総売上",
      totalOrders: "総注文数",
      totalCustomers: "総顧客数",
      totalProducts: "総商品数",
      newCustomers: "新規顧客",
      activeCustomers: "アクティブ顧客",
      lowStockProducts: "在庫不足商品",
      outOfStockProducts: "在庫切れ商品",
      conversionRate: "コンバージョン率",
      averageOrderValue: "平均注文価値",
      customerRetention: "顧客維持率",
      topProducts: "人気商品",
      topSpenders: "高額顧客",
      topCategories: "人気カテゴリ",
      monthlyRevenue: "月次売上",
      customerGrowth: "顧客成長",
      inventoryStatus: "在庫状況",
      performanceMetrics: "パフォーマンス指標",
      loading: "レポートデータを読み込み中...",
      noData: "データがありません"
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
                  <DownloadIcon className="h-4 w-4 mr-2" />
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
            <Button variant="outline" size="sm" onClick={loadReportData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sales">{t.sales}</TabsTrigger>
            <TabsTrigger value="customers">{t.customers}</TabsTrigger>
            <TabsTrigger value="inventory">{t.inventory}</TabsTrigger>
            <TabsTrigger value="performance">{t.performance}</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            {/* Sales Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.sales.total, language)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getTrendIcon(data.sales.trend)}
                    <span className={`ml-1 ${getTrendColor(data.sales.trend)}`}>
                      {Math.abs(data.sales.trend)}% from last period
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
                  <div className="text-2xl font-bold">{data.sales.monthly.reduce((sum, m) => sum + m.orders, 0)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(data.sales.total / Math.max(data.sales.monthly.reduce((sum, m) => sum + m.orders, 0), 1), language)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.sales.trend}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {t.monthlyRevenue}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.sales.monthly}>
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
                        formatter={(value: any) => [formatCurrency(value, language), 'Revenue']}
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

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    {t.topProducts}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.sales.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(product.revenue, language)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            {/* Customer Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalCustomers}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.customers.total.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.newCustomers}</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{data.customers.new}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activeCustomers}</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{data.customers.active}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.customerRetention}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Customer Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {t.customerGrowth}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data.customers.growth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
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
                        formatter={(value: any, name: any) => [
                          value.toLocaleString(), 
                          name === 'newCustomers' ? 'New Customers' : 'Total Customers'
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
                        dataKey="totalCustomers" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        name="Total Customers"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Spenders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
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

          <TabsContent value="inventory" className="space-y-4">
            {/* Inventory Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.inventory.total.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.lowStockProducts}</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{data.inventory.lowStock}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.outOfStockProducts}</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{data.inventory.outOfStock}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(data.inventory.byCategory.reduce((sum, cat) => sum + cat.value, 0), language)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Inventory Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {t.inventoryStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={data.inventory.status}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) => `${status} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.inventory.status.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          value.toLocaleString(), 
                          name === 'count' ? 'Products' : name
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Inventory by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Inventory by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.inventory.byCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">{category.count} products</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.value, language)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {/* Performance Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.conversionRate}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.conversionRate}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.averageOrderValue}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.performance.averageOrderValue, language)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.customerRetention}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.customerRetention}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Performance Metrics Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {t.performanceMetrics}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.performance.metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="metric" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickFormatter={(value) => 
                          value > 1000 ? formatCurrency(value, language) : `${value}%`
                        }
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value: any, name: any) => [
                          name === 'value' ? 
                            (value > 1000 ? formatCurrency(value, language) : `${value}%`) : 
                            value, 
                          name === 'value' ? 'Current' : 'Target'
                        ]}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#3B82F6" 
                        name="Current Value"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="target" 
                        fill="#10B981" 
                        name="Target Value"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {t.topCategories}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.performance.topCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">{category.percentage}% of revenue</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.revenue, language)}</div>
                        </div>
                      </div>
                    ))}
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
