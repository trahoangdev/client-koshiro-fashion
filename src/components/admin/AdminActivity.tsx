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
  Shield
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

interface AdminActivityProps {
  activities: ActivityLog[];
  onRefresh: () => void;
  onExport: () => void;
  onClear: () => void;
  onFilter: (filters: Record<string, string>) => void;
  isLoading?: boolean;
}

export default function AdminActivity({
  activities,
  onRefresh,
  onExport,
  onClear,
  onFilter,
  isLoading = false
}: AdminActivityProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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
      custom: 'Custom Range'
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
      custom: 'Tùy chỉnh'
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
      custom: 'カスタム範囲'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

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

  const handleViewDetails = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setIsDetailDialogOpen(true);
  };

  const handleFilter = () => {
    onFilter({
      search: searchTerm,
      category: selectedCategory,
      severity: selectedSeverity,
      dateRange
    });
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all activity logs?')) {
      onClear();
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (searchTerm && !activity.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activity.details.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && activity.category !== selectedCategory) {
      return false;
    }
    if (selectedSeverity !== 'all' && activity.severity !== selectedSeverity) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t.clear}
          </Button>
        </div>
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

              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
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
  );
} 