import { useState, useEffect } from "react";
import { 
  Activity,
  Clock,
  User,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  Database,
  Eye,
  Filter,
  RefreshCw,
  Calendar,
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  Shield,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { useNavigate } from "react-router-dom";
import { exportImportService } from "@/lib/exportImportService";
import AdminLayout from "@/components/admin/AdminLayout";
import { Label } from "@/components/ui/label";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'user' | 'product' | 'order' | 'system' | 'security' | 'data';
}

interface ActivityStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
}

export default function AdminActivity() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byCategory: {},
    bySeverity: {}
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Activity Log',
      subtitle: 'Monitor system activities and user actions',
      searchPlaceholder: 'Search activities...',
      filterByCategory: 'Filter by Category',
      filterBySeverity: 'Filter by Severity',
      filterByDate: 'Filter by Date',
      allCategories: 'All Categories',
      allSeverities: 'All Severities',
      allDates: 'All Time',
      user: 'User',
      product: 'Product',
      order: 'Order',
      system: 'System',
      security: 'Security',
      data: 'Data',
      info: 'Info',
      warning: 'Warning',
      error: 'Error',
      success: 'Success',
      action: 'Action',
      resource: 'Resource',
      timestamp: 'Timestamp',
      details: 'Details',
      ipAddress: 'IP Address',
      userAgent: 'User Agent',
      severity: 'Severity',
      category: 'Category',
      viewDetails: 'View Details',
      export: 'Export',
      clear: 'Clear Log',
      refresh: 'Refresh',
      noActivities: 'No activities found',
      loading: 'Loading activities...',
      activityDetails: 'Activity Details',
      close: 'Close',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      custom: 'Custom Range',
      totalActivities: 'Total Activities',
      todayActivities: 'Today',
      thisWeekActivities: 'This Week',
      thisMonthActivities: 'This Month'
    },
    vi: {
      title: 'Nhật ký hoạt động',
      subtitle: 'Theo dõi hoạt động hệ thống và hành động người dùng',
      searchPlaceholder: 'Tìm kiếm hoạt động...',
      filterByCategory: 'Lọc theo danh mục',
      filterBySeverity: 'Lọc theo mức độ',
      filterByDate: 'Lọc theo ngày',
      allCategories: 'Tất cả danh mục',
      allSeverities: 'Tất cả mức độ',
      allDates: 'Tất cả thời gian',
      user: 'Người dùng',
      product: 'Sản phẩm',
      order: 'Đơn hàng',
      system: 'Hệ thống',
      security: 'Bảo mật',
      data: 'Dữ liệu',
      info: 'Thông tin',
      warning: 'Cảnh báo',
      error: 'Lỗi',
      success: 'Thành công',
      action: 'Hành động',
      resource: 'Tài nguyên',
      timestamp: 'Thời gian',
      details: 'Chi tiết',
      ipAddress: 'Địa chỉ IP',
      userAgent: 'User Agent',
      severity: 'Mức độ',
      category: 'Danh mục',
      viewDetails: 'Xem chi tiết',
      export: 'Xuất',
      clear: 'Xóa nhật ký',
      refresh: 'Làm mới',
      noActivities: 'Không tìm thấy hoạt động nào',
      loading: 'Đang tải hoạt động...',
      activityDetails: 'Chi tiết hoạt động',
      close: 'Đóng',
      today: 'Hôm nay',
      thisWeek: 'Tuần này',
      thisMonth: 'Tháng này',
      lastMonth: 'Tháng trước',
      custom: 'Tùy chỉnh',
      totalActivities: 'Tổng hoạt động',
      todayActivities: 'Hôm nay',
      thisWeekActivities: 'Tuần này',
      thisMonthActivities: 'Tháng này'
    },
    ja: {
      title: 'アクティビティログ',
      subtitle: 'システムアクティビティとユーザーアクションを監視',
      searchPlaceholder: 'アクティビティを検索...',
      filterByCategory: 'カテゴリで絞り込み',
      filterBySeverity: '重要度で絞り込み',
      filterByDate: '日付で絞り込み',
      allCategories: 'すべてのカテゴリ',
      allSeverities: 'すべての重要度',
      allDates: 'すべての期間',
      user: 'ユーザー',
      product: '商品',
      order: '注文',
      system: 'システム',
      security: 'セキュリティ',
      data: 'データ',
      info: '情報',
      warning: '警告',
      error: 'エラー',
      success: '成功',
      action: 'アクション',
      resource: 'リソース',
      timestamp: 'タイムスタンプ',
      details: '詳細',
      ipAddress: 'IPアドレス',
      userAgent: 'ユーザーエージェント',
      severity: '重要度',
      category: 'カテゴリ',
      viewDetails: '詳細を見る',
      export: 'エクスポート',
      clear: 'ログをクリア',
      refresh: '更新',
      noActivities: 'アクティビティが見つかりません',
      loading: 'アクティビティを読み込み中...',
      activityDetails: 'アクティビティ詳細',
      close: '閉じる',
      today: '今日',
      thisWeek: '今週',
      thisMonth: '今月',
      lastMonth: '先月',
      custom: 'カスタム範囲',
      totalActivities: '総アクティビティ',
      todayActivities: '今日',
      thisWeekActivities: '今週',
      thisMonthActivities: '今月'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) {
        navigate("/admin/login");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, selectedCategory, selectedSeverity, dateRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Admin User',
          userEmail: 'admin@example.com',
          action: 'Created product',
          resource: 'Product',
          resourceId: 'prod123',
          details: 'Created new product "Japanese Style Shirt"',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date().toISOString(),
          severity: 'info',
          category: 'product'
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Customer User',
          userEmail: 'customer@example.com',
          action: 'Placed order',
          resource: 'Order',
          resourceId: 'order456',
          details: 'Placed order #ORD-2024-001',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'success',
          category: 'order'
        },
        {
          id: '3',
          userId: 'user1',
          userName: 'Admin User',
          userEmail: 'admin@example.com',
          action: 'Updated settings',
          resource: 'System',
          resourceId: 'settings',
          details: 'Updated system configuration',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          severity: 'warning',
          category: 'system'
        }
      ];

      setActivities(mockActivities);
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const stats: ActivityStats = {
        total: mockActivities.length,
        today: mockActivities.filter(a => new Date(a.timestamp) >= today).length,
        thisWeek: mockActivities.filter(a => new Date(a.timestamp) >= weekAgo).length,
        thisMonth: mockActivities.filter(a => new Date(a.timestamp) >= monthAgo).length,
        byCategory: mockActivities.reduce((acc, activity) => {
          acc[activity.category] = (acc[activity.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        bySeverity: mockActivities.reduce((acc, activity) => {
          acc[activity.severity] = (acc[activity.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast({
        title: 'Error loading data',
        description: 'Could not load activity logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // Filter by severity
    if (selectedSeverity !== "all") {
      filtered = filtered.filter(activity => activity.severity === selectedSeverity);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "thisWeek":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "thisMonth":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case "lastMonth": {
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
          const endDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filtered = filtered.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate >= startDate && activityDate < endDate;
          });
          setFilteredActivities(filtered);
          return;
        }
        default:
          setFilteredActivities(filtered);
          return;
      }
      
      filtered = filtered.filter(activity => new Date(activity.timestamp) >= startDate);
    }

    setFilteredActivities(filtered);
  };

  const handleViewDetails = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setIsDetailDialogOpen(true);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      setIsExporting(true);
      
      // Prepare activity data for export
      const exportData = filteredActivities.map(activity => ({
        id: activity.id,
        timestamp: activity.timestamp,
        userId: activity.userId,
        userName: activity.userName,
        userEmail: activity.userEmail,
        action: activity.action,
        resource: activity.resource,
        resourceId: activity.resourceId,
        details: activity.details,
        category: activity.category,
        severity: activity.severity,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent
      }));

      // Create export job
      const job = await exportImportService.startExportJob('all', format, exportData);
      
      toast({
        title: language === 'vi' ? "Xuất nhật ký hoạt động" : 
               language === 'ja' ? "アクティビティログエクスポート" : 
               "Export Activity Log",
        description: language === 'vi' ? `Đang xuất nhật ký hoạt động sang ${format.toUpperCase()}...` :
                     language === 'ja' ? `アクティビティログを${format.toUpperCase()}にエクスポート中...` :
                     `Exporting activity log to ${format.toUpperCase()}...`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getExportJob(job.id);
        if (updatedJob?.status === 'completed' && updatedJob.downloadUrl) {
          // Trigger download
          const link = document.createElement('a');
          link.href = updatedJob.downloadUrl;
          const extension = format === 'excel' ? 'xls' : format;
          link.download = `activity_log_export_${new Date().toISOString().split('T')[0]}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(updatedJob.downloadUrl);
          
          toast({
            title: language === 'vi' ? "Xuất thành công" : 
                   language === 'ja' ? "エクスポート成功" : 
                   "Export Successful",
            description: language === 'vi' ? `Nhật ký hoạt động đã được xuất sang ${format.toUpperCase()}` :
                         language === 'ja' ? `アクティビティログが${format.toUpperCase()}にエクスポートされました` :
                         `Activity log exported to ${format.toUpperCase()}`,
          });
          setIsExporting(false);
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: language === 'vi' ? "Xuất thất bại" : 
                   language === 'ja' ? "エクスポート失敗" : 
                   "Export Failed",
            description: updatedJob.error || (language === 'vi' ? "Không thể xuất nhật ký hoạt động" :
                         language === 'ja' ? "アクティビティログをエクスポートできませんでした" :
                         "Failed to export activity log"),
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
        description: language === 'vi' ? "Không thể xuất nhật ký hoạt động" :
                     language === 'ja' ? "アクティビティログをエクスポートできませんでした" :
                     "Failed to export activity log",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all activity logs?')) {
      setActivities([]);
      setFilteredActivities([]);
      toast({
        title: 'Log cleared',
        description: 'All activity logs have been cleared',
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      info: { label: t.info, variant: "default" as const },
      warning: { label: t.warning, variant: "secondary" as const },
      error: { label: t.error, variant: "destructive" as const },
      success: { label: t.success, variant: "default" as const }
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.info;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user': return <User className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels = {
      user: t.user,
      product: t.product,
      order: t.order,
      system: t.system,
      security: t.security,
      data: t.data
    };
    return categoryLabels[category as keyof typeof categoryLabels] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
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
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
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
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t.clear}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalActivities}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.todayActivities}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.thisWeekActivities}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.thisMonthActivities}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterByCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCategories}</SelectItem>
                    <SelectItem value="user">{t.user}</SelectItem>
                    <SelectItem value="product">{t.product}</SelectItem>
                    <SelectItem value="order">{t.order}</SelectItem>
                    <SelectItem value="system">{t.system}</SelectItem>
                    <SelectItem value="security">{t.security}</SelectItem>
                    <SelectItem value="data">{t.data}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterBySeverity} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allSeverities}</SelectItem>
                    <SelectItem value="info">{t.info}</SelectItem>
                    <SelectItem value="warning">{t.warning}</SelectItem>
                    <SelectItem value="error">{t.error}</SelectItem>
                    <SelectItem value="success">{t.success}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterByDate} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allDates}</SelectItem>
                    <SelectItem value="today">{t.today}</SelectItem>
                    <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
                    <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                    <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t.user}</th>
                    <th className="text-left p-4">{t.action}</th>
                    <th className="text-left p-4">{t.resource}</th>
                    <th className="text-left p-4">{t.category}</th>
                    <th className="text-left p-4">{t.severity}</th>
                    <th className="text-left p-4">{t.timestamp}</th>
                    <th className="text-left p-4">{t.details}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{activity.userName}</div>
                          <div className="text-sm text-muted-foreground">{activity.userEmail}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{activity.action}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(activity.category)}
                          <span>{activity.resource}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {getCategoryLabel(activity.category)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {getSeverityBadge(activity.severity)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {formatDate(activity.timestamp)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground truncate max-w-32">
                            {activity.details}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(activity)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t.viewDetails}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noActivities}</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" || selectedSeverity !== "all" || dateRange !== "all"
                  ? "Try adjusting your filters"
                  : "No activities have been logged yet"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Activity Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.activityDetails}</DialogTitle>
            </DialogHeader>
            {selectedActivity && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t.user}</Label>
                    <p>{selectedActivity.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedActivity.userEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t.action}</Label>
                    <p>{selectedActivity.action}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t.resource}</Label>
                    <p>{selectedActivity.resource}</p>
                    <p className="text-sm text-muted-foreground">ID: {selectedActivity.resourceId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t.timestamp}</Label>
                    <p>{formatDate(selectedActivity.timestamp)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t.category}</Label>
                    <Badge variant="outline">
                      {getCategoryLabel(selectedActivity.category)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t.severity}</Label>
                    {getSeverityBadge(selectedActivity.severity)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">{t.details}</Label>
                  <p className="text-sm">{selectedActivity.details}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t.ipAddress}</Label>
                    <p className="text-sm font-mono">{selectedActivity.ipAddress}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t.userAgent}</Label>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedActivity.userAgent}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
} 
