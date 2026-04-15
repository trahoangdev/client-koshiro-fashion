import { useState } from "react";
import { 
  Plus,
  ShoppingCart,
  Package,
  Users,
  Settings,
  BarChart3,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  badge?: string;
  disabled?: boolean;
}

interface AdminQuickActionsProps {
  stats?: {
    pendingOrders: number;
    lowStockProducts: number;
    newCustomers: number;
    totalRevenue: number;
  };
  onRefresh?: () => void;
}

export default function AdminQuickActions({ stats, onRefresh }: AdminQuickActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, t: tCommon } = useLanguage();

  const translations = {
    en: {
      title: 'Quick Actions',
      addProduct: 'Add Product',
      addCategory: 'Add Category',
      viewOrders: 'View Orders',
      manageProducts: 'Manage Products',
      manageUsers: 'Manage Users',
      viewAnalytics: 'View Analytics',
      generateReport: 'Generate Report',
      exportData: 'Export Data',
      importData: 'Import Data',
      refreshData: 'Refresh Data',
      viewNotifications: 'View Notifications',
      systemSettings: 'System Settings',
      pendingOrders: 'Pending Orders',
      lowStock: 'Low Stock',
      newCustomers: 'New Customers',
      totalRevenue: 'Total Revenue'
    },
    vi: {
      title: 'Hành động nhanh',
      addProduct: 'Thêm sản phẩm',
      addCategory: 'Thêm danh mục',
      viewOrders: 'Xem đơn hàng',
      manageProducts: 'Quản lý sản phẩm',
      manageUsers: 'Quản lý người dùng',
      viewAnalytics: 'Xem phân tích',
      generateReport: 'Tạo báo cáo',
      exportData: 'Xuất dữ liệu',
      importData: 'Nhập dữ liệu',
      refreshData: 'Làm mới dữ liệu',
      viewNotifications: 'Xem thông báo',
      systemSettings: 'Cài đặt hệ thống',
      pendingOrders: 'Đơn hàng chờ',
      lowStock: 'Hàng tồn kho thấp',
      newCustomers: 'Khách hàng mới',
      totalRevenue: 'Tổng doanh thu'
    },
    ja: {
      title: 'クイックアクション',
      addProduct: '商品を追加',
      addCategory: 'カテゴリを追加',
      viewOrders: '注文を表示',
      manageProducts: '商品を管理',
      manageUsers: 'ユーザーを管理',
      viewAnalytics: '分析を表示',
      generateReport: 'レポートを生成',
      exportData: 'データをエクスポート',
      importData: 'データをインポート',
      refreshData: 'データを更新',
      viewNotifications: '通知を表示',
      systemSettings: 'システム設定',
      pendingOrders: '保留中の注文',
      lowStock: '在庫不足',
      newCustomers: '新規顧客',
      totalRevenue: '総収益'
    }
  };

  const tl = translations[language as keyof typeof translations] || translations.en;

  const quickActions: QuickAction[] = [
    {
      id: 'add-product',
      title: tl.addProduct,
      description: 'Create a new product',
      icon: <Plus className="h-4 w-4" />,
      action: () => navigate('/admin/products/new'),
      variant: 'default'
    },
    {
      id: 'add-category',
      title: tl.addCategory,
      description: 'Create a new category',
      icon: <Package className="h-4 w-4" />,
      action: () => navigate('/admin/categories'),
      variant: 'outline'
    },
    {
      id: 'view-orders',
      title: tl.viewOrders,
      description: 'View and manage orders',
      icon: <ShoppingCart className="h-4 w-4" />,
      action: () => navigate('/admin/orders'),
      variant: 'secondary',
      badge: stats?.pendingOrders?.toString()
    },
    {
      id: 'manage-products',
      title: tl.manageProducts,
      description: 'Manage all products',
      icon: <Package className="h-4 w-4" />,
      action: () => navigate('/admin/products'),
      variant: 'outline',
      badge: stats?.lowStockProducts?.toString()
    },
    {
      id: 'manage-users',
      title: tl.manageUsers,
      description: 'Manage user accounts',
      icon: <Users className="h-4 w-4" />,
      action: () => navigate('/admin/users'),
      variant: 'outline',
      badge: stats?.newCustomers?.toString()
    },
    {
      id: 'view-analytics',
      title: tl.viewAnalytics,
      description: 'View detailed analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigate('/admin/analytics'),
      variant: 'secondary'
    },
    {
      id: 'generate-report',
      title: tl.generateReport,
      description: 'Generate business reports',
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/admin/reports'),
      variant: 'outline'
    },
    {
      id: 'system-settings',
      title: tl.systemSettings,
      description: 'Configure system settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/admin/settings'),
      variant: 'outline'
    }
  ];

  const handleAction = (action: QuickAction) => {
    try {
      action.action();
      toast({
        title: tCommon('success'),
        description: tCommon('updateSuccess'),
      });
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: tCommon('errorUpdating'),
        variant: 'destructive',
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: tCommon('success'),
      description: tCommon('processingRequest'),
    });
  };

  const handleImportData = () => {
    toast({
      title: tCommon('success'),
      description: tCommon('processingRequest'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {tl.pendingOrders}
                  </p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {tl.lowStock}
                  </p>
                  <p className="text-2xl font-bold">{stats.lowStockProducts}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {tl.newCustomers}
                  </p>
                  <p className="text-2xl font-bold">{stats.newCustomers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {tl.totalRevenue}
                  </p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {tl.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {tl.exportData}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportData}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportData}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportData}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                {tl.importData}
              </Button>
              
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {tl.refreshData}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => handleAction(action)}
                disabled={action.disabled}
              >
                <div className="flex items-center gap-2 w-full">
                  {action.icon}
                  <span className="font-medium">{action.title}</span>
                  {action.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  {action.description}
                </p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 