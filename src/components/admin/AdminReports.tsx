import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Eye,
  Printer,
  Share2,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/currency";
import { api } from "@/lib/api";

interface ReportData {
  salesReport: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: Array<{
      name: string;
      sales: number;
      quantity: number;
      revenue: number;
    }>;
    salesByCategory: Array<{
      category: string;
      sales: number;
      percentage: number;
    }>;
    salesByMonth: Array<{
      month: string;
      sales: number;
      orders: number;
    }>;
  };
  customerReport: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    topCustomers: Array<{
      name: string;
      email: string;
      totalSpent: number;
      orders: number;
      lastOrder: string;
    }>;
    customerSegments: Array<{
      segment: string;
      count: number;
      percentage: number;
    }>;
  };
  inventoryReport: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    topSellingProducts: Array<{
      name: string;
      category: string;
      stock: number;
      sold: number;
      revenue: number;
    }>;
    categoryInventory: Array<{
      category: string;
      products: number;
      totalStock: number;
      averagePrice: number;
    }>;
  };
}

export default function AdminReports() {
  const { language } = useLanguage();
  const [reportData, setReportData] = useState<ReportData>({
    salesReport: {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topProducts: [],
      salesByCategory: [],
      salesByMonth: []
    },
    customerReport: {
      totalCustomers: 0,
      newCustomers: 0,
      activeCustomers: 0,
      topCustomers: [],
      customerSegments: []
    },
    inventoryReport: {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      topSellingProducts: [],
      categoryInventory: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("sales");
  const [timeRange, setTimeRange] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from API
        const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
          api.getAdminStats(),
          api.getAdminOrders({ page: 1, limit: 100 }),
          api.getProducts({ page: 1, limit: 100 })
        ]);

        // Transform data for reports
        const transformedData: ReportData = {
          salesReport: {
            totalSales: statsResponse.totalRevenue,
            totalOrders: statsResponse.totalOrders,
            averageOrderValue: statsResponse.totalRevenue / statsResponse.totalOrders || 0,
            topProducts: productsResponse.data.slice(0, 10).map(product => ({
              name: product.name,
              sales: Math.floor(Math.random() * 100) + 10, // Mock data
              quantity: Math.floor(Math.random() * 50) + 5,
              revenue: product.salePrice || product.price
            })),
            salesByCategory: [
              { category: "Kimono", sales: 8000000, percentage: 32 },
              { category: "Haori", sales: 6000000, percentage: 24 },
              { category: "Yukata", sales: 4000000, percentage: 16 },
              { category: "Tops", sales: 3000000, percentage: 12 },
              { category: "Bottoms", sales: 2500000, percentage: 10 },
              { category: "Accessories", sales: 2000000, percentage: 8 }
            ],
            salesByMonth: [
              { month: "Jan", sales: 18000000, orders: 900 },
              { month: "Feb", sales: 20000000, orders: 1000 },
              { month: "Mar", sales: 22000000, orders: 1100 },
              { month: "Apr", sales: 24000000, orders: 1200 },
              { month: "May", sales: 25000000, orders: 1250 },
              { month: "Jun", sales: 25000000, orders: 1250 }
            ]
          },
          customerReport: {
            totalCustomers: statsResponse.totalUsers,
            newCustomers: Math.floor(statsResponse.totalUsers * 0.15),
            activeCustomers: Math.floor(statsResponse.totalUsers * 0.8),
            topCustomers: ordersResponse.data.slice(0, 10).map(order => ({
              name: order.userId?.name || 'Unknown Customer',
              email: order.userId?.email || '',
              totalSpent: order.totalAmount,
              orders: 1, // Mock data
              lastOrder: order.createdAt
            })),
            customerSegments: [
              { segment: "VIP", count: Math.floor(statsResponse.totalUsers * 0.1), percentage: 10 },
              { segment: "Regular", count: Math.floor(statsResponse.totalUsers * 0.6), percentage: 60 },
              { segment: "New", count: Math.floor(statsResponse.totalUsers * 0.3), percentage: 30 }
            ]
          },
          inventoryReport: {
            totalProducts: statsResponse.totalProducts,
            lowStockProducts: Math.floor(statsResponse.totalProducts * 0.2),
            outOfStockProducts: Math.floor(statsResponse.totalProducts * 0.05),
            topSellingProducts: productsResponse.data.slice(0, 10).map(product => ({
              name: product.name,
              category: typeof product.categoryId === 'object' ? product.categoryId.name : 'Unknown',
              stock: product.stock,
              sold: Math.floor(Math.random() * 100) + 10, // Mock data
              revenue: (product.salePrice || product.price) * (Math.floor(Math.random() * 100) + 10)
            })),
            categoryInventory: [
              { category: "Kimono", products: 120, totalStock: 1800, averagePrice: 2000000 },
              { category: "Haori", products: 95, totalStock: 1425, averagePrice: 1000000 },
              { category: "Yukata", products: 85, totalStock: 2125, averagePrice: 600000 },
              { category: "Tops", products: 75, totalStock: 2250, averagePrice: 400000 },
              { category: "Bottoms", products: 65, totalStock: 1430, averagePrice: 350000 }
            ]
          }
        };

        setReportData(transformedData);
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, [timeRange]);

  const translations = {
    en: {
      title: "Reports & Analytics",
      subtitle: "Comprehensive business insights and performance reports",
      salesReport: "Sales Report",
      customerReport: "Customer Report",
      inventoryReport: "Inventory Report",
      export: "Export",
      print: "Print",
      share: "Share",
      refresh: "Refresh",
      search: "Search...",
      timeRange: "Time Range",
      totalSales: "Total Sales",
      totalOrders: "Total Orders",
      averageOrderValue: "Average Order Value",
      topProducts: "Top Products",
      salesByCategory: "Sales by Category",
      salesByMonth: "Sales by Month",
      totalCustomers: "Total Customers",
      newCustomers: "New Customers",
      activeCustomers: "Active Customers",
      topCustomers: "Top Customers",
      customerSegments: "Customer Segments",
      totalProducts: "Total Products",
      lowStockProducts: "Low Stock Products",
      outOfStockProducts: "Out of Stock",
      topSellingProducts: "Top Selling Products",
      categoryInventory: "Category Inventory",
      revenue: "Revenue",
      quantity: "Quantity",
      stock: "Stock",
      sold: "Sold",
      category: "Category",
      percentage: "Percentage",
      lastOrder: "Last Order",
      segment: "Segment",
      count: "Count",
      averagePrice: "Average Price"
    },
    vi: {
      title: "Báo Cáo & Phân Tích",
      subtitle: "Thông tin chi tiết toàn diện về kinh doanh và báo cáo hiệu suất",
      salesReport: "Báo Cáo Bán Hàng",
      customerReport: "Báo Cáo Khách Hàng",
      inventoryReport: "Báo Cáo Kho Hàng",
      export: "Xuất",
      print: "In",
      share: "Chia Sẻ",
      refresh: "Làm Mới",
      search: "Tìm kiếm...",
      timeRange: "Khoảng Thời Gian",
      totalSales: "Tổng Doanh Thu",
      totalOrders: "Tổng Đơn Hàng",
      averageOrderValue: "Giá Trị Đơn Hàng TB",
      topProducts: "Sản Phẩm Bán Chạy",
      salesByCategory: "Doanh Thu Theo Danh Mục",
      salesByMonth: "Doanh Thu Theo Tháng",
      totalCustomers: "Tổng Khách Hàng",
      newCustomers: "Khách Hàng Mới",
      activeCustomers: "Khách Hàng Hoạt Động",
      topCustomers: "Khách Hàng Hàng Đầu",
      customerSegments: "Phân Khúc Khách Hàng",
      totalProducts: "Tổng Sản Phẩm",
      lowStockProducts: "Sản Phẩm Sắp Hết",
      outOfStockProducts: "Hết Hàng",
      topSellingProducts: "Sản Phẩm Bán Chạy",
      categoryInventory: "Kho Hàng Theo Danh Mục",
      revenue: "Doanh Thu",
      quantity: "Số Lượng",
      stock: "Tồn Kho",
      sold: "Đã Bán",
      category: "Danh Mục",
      percentage: "Phần Trăm",
      lastOrder: "Đơn Hàng Cuối",
      segment: "Phân Khúc",
      count: "Số Lượng",
      averagePrice: "Giá Trung Bình"
    },
    ja: {
      title: "レポートと分析",
      subtitle: "包括的なビジネス洞察とパフォーマンスレポート",
      salesReport: "売上レポート",
      customerReport: "顧客レポート",
      inventoryReport: "在庫レポート",
      export: "エクスポート",
      print: "印刷",
      share: "共有",
      refresh: "更新",
      search: "検索...",
      timeRange: "時間範囲",
      totalSales: "総売上",
      totalOrders: "総注文数",
      averageOrderValue: "平均注文価値",
      topProducts: "トップ製品",
      salesByCategory: "カテゴリ別売上",
      salesByMonth: "月別売上",
      totalCustomers: "総顧客数",
      newCustomers: "新規顧客",
      activeCustomers: "アクティブ顧客",
      topCustomers: "トップ顧客",
      customerSegments: "顧客セグメント",
      totalProducts: "総製品数",
      lowStockProducts: "在庫不足製品",
      outOfStockProducts: "在庫切れ",
      topSellingProducts: "トップセリング製品",
      categoryInventory: "カテゴリ別在庫",
      revenue: "収益",
      quantity: "数量",
      stock: "在庫",
      sold: "販売済み",
      category: "カテゴリ",
      percentage: "パーセンテージ",
      lastOrder: "最後の注文",
      segment: "セグメント",
      count: "数",
      averagePrice: "平均価格"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US');
  };

  const handleExport = (type: string) => {
    // Implement export functionality
    console.log(`Exporting ${type} report...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing report...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">
            {language === 'vi' ? 'Đang tải báo cáo...' :
             language === 'ja' ? 'レポートを読み込み中...' :
             'Loading reports...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
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
          <Button onClick={() => handleExport(reportType)} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            {t.print}
          </Button>
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            {t.share}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          {language === 'vi' ? 'Bộ Lọc' : language === 'ja' ? 'フィルター' : 'Filters'}
        </Button>
      </div>

      {/* Reports Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t.salesReport}
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t.customerReport}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t.inventoryReport}
          </TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          {/* Sales Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.totalSales}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrencyForDisplay(reportData.salesReport.totalSales)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.totalOrders}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.salesReport.totalOrders.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.averageOrderValue}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrencyForDisplay(reportData.salesReport.averageOrderValue)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>{t.topProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.salesReport.topProducts.slice(0, 8).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrencyForDisplay(product.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{product.quantity} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>{t.salesByCategory}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.salesReport.salesByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrencyForDisplay(category.sales)}</p>
                        <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Report */}
        <TabsContent value="customer" className="space-y-6">
          {/* Customer Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.totalCustomers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.customerReport.totalCustomers.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.newCustomers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.customerReport.newCustomers.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.activeCustomers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.customerReport.activeCustomers.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>{t.topCustomers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.customerReport.topCustomers.slice(0, 8).map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrencyForDisplay(customer.totalSpent)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(customer.lastOrder)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>{t.customerSegments}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.customerReport.customerSegments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{segment.segment}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{segment.count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{segment.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.inventoryReport.totalProducts.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.lowStockProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{reportData.inventoryReport.lowStockProducts.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t.outOfStockProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{reportData.inventoryReport.outOfStockProducts.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle>{t.topSellingProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.inventoryReport.topSellingProducts.slice(0, 8).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrencyForDisplay(product.revenue)}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>{t.categoryInventory}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.inventoryReport.categoryInventory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{category.products} products</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrencyForDisplay(category.averagePrice)} avg
                        </p>
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
  );
}
