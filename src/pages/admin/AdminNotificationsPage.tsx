import { useState, useEffect } from "react";
import { 
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  MoreHorizontal,
  Clock,
  User,
  Package,
  ShoppingCart,
  CreditCard,
  Shield,
  Zap,
  Plus,
  Edit,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { Notification } from "@/lib/api";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  orderNotifications: boolean;
  userNotifications: boolean;
  productNotifications: boolean;
  systemNotifications: boolean;
  alertNotifications: boolean;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    refreshNotifications,
    createNotification,
    updateNotification,
    bulkMarkAsRead,
    bulkDelete
  } = useNotifications();
  
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sound: true,
    orderNotifications: true,
    userNotifications: true,
    productNotifications: true,
    systemNotifications: true,
    alertNotifications: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  // Form state for creating/editing notifications
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    category: 'system' as 'system' | 'order' | 'product' | 'user' | 'marketing',
    actionUrl: '',
    expiresAt: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) {
        navigate("/admin/login");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, filterType, filterCategory, filterStatus]);

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(notification => notification.category === filterCategory);
    }

    // Filter by status
    if (filterStatus !== "all") {
      if (filterStatus === "unread") {
        filtered = filtered.filter(notification => !notification.read);
      } else if (filterStatus === "read") {
        filtered = filtered.filter(notification => notification.read);
      }
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast({
        title: language === 'vi' ? "Đã đánh dấu đã đọc" : 
               language === 'ja' ? "既読にマークされました" : 
               "Marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: language === 'vi' ? "Đã đánh dấu tất cả" : 
               language === 'ja' ? "すべて既読にしました" : 
               "Marked all as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  const handleArchiveNotification = async (id: string) => {
    try {
      await archiveNotification(id);
      toast({
        title: language === 'vi' ? "Đã lưu trữ thông báo" : 
               language === 'ja' ? "通知がアーカイブされました" : 
               "Notification archived",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive notification",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      toast({
        title: language === 'vi' ? "Đã xóa thông báo" : 
               language === 'ja' ? "通知を削除しました" : 
               "Notification deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      toast({
        title: language === 'vi' ? "Đã xóa tất cả" : 
               language === 'ja' ? "すべて削除しました" : 
               "Cleared all notifications",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear all notifications",
        variant: "destructive"
      });
    }
  };

  const handleCreateNotification = async () => {
    try {
      await createNotification(formData);
      setShowCreateDialog(false);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        category: 'system',
        actionUrl: '',
        expiresAt: ''
      });
      toast({
        title: "Success",
        description: "Notification created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive"
      });
    }
  };

  const handleEditNotification = async () => {
    if (!editingNotification) return;
    
    try {
      await updateNotification(editingNotification._id, formData);
      setShowEditDialog(false);
      setEditingNotification(null);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        category: 'system',
        actionUrl: '',
        expiresAt: ''
      });
      toast({
        title: "Success",
        description: "Notification updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive"
      });
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await bulkMarkAsRead(selectedNotifications);
      setSelectedNotifications([]);
      toast({
        title: "Success",
        description: `Marked ${selectedNotifications.length} notifications as read`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await bulkDelete(selectedNotifications);
      setSelectedNotifications([]);
      toast({
        title: "Success",
        description: `Deleted ${selectedNotifications.length} notifications`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notifications",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      actionUrl: notification.actionUrl || '',
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : ''
    });
    setShowEditDialog(true);
  };

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50';
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'marketing': return <Zap className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return language === 'vi' ? 'Thông tin' : language === 'ja' ? '情報' : 'Info';
      case 'success': return language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success';
      case 'warning': return language === 'vi' ? 'Cảnh báo' : language === 'ja' ? '警告' : 'Warning';
      case 'error': return language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error';
      default: return type;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'order': return language === 'vi' ? 'Đơn hàng' : language === 'ja' ? '注文' : 'Order';
      case 'user': return language === 'vi' ? 'Người dùng' : language === 'ja' ? 'ユーザー' : 'User';
      case 'product': return language === 'vi' ? 'Sản phẩm' : language === 'ja' ? '商品' : 'Product';
      case 'system': return language === 'vi' ? 'Hệ thống' : language === 'ja' ? 'システム' : 'System';
      case 'marketing': return language === 'vi' ? 'Marketing' : language === 'ja' ? 'マーケティング' : 'Marketing';
      default: return category;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return language === 'vi' ? 'Vừa xong' : language === 'ja' ? '今' : 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} ${language === 'vi' ? 'phút trước' : language === 'ja' ? '分前' : 'min ago'}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${language === 'vi' ? 'giờ trước' : language === 'ja' ? '時間前' : 'hours ago'}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${language === 'vi' ? 'ngày trước' : language === 'ja' ? '日前' : 'days ago'}`;
  };

  const translations = {
    en: {
      title: "Notifications",
      subtitle: "Real-time system notifications and alerts",
      search: "Search notifications...",
      filter: "Filter",
      markAllRead: "Mark All as Read",
      clearAll: "Clear All",
      settings: "Settings",
      all: "All",
      unread: "Unread",
      read: "Read",
      archived: "Archived",
      priority: "Priority",
      type: "Type",
      status: "Status",
      noNotifications: "No notifications found",
      loading: "Loading notifications...",
      emailNotifications: "Email Notifications",
      pushNotifications: "Push Notifications",
      soundNotifications: "Sound Notifications",
      orderNotifications: "Order Notifications",
      userNotifications: "User Notifications",
      productNotifications: "Product Notifications",
      systemNotifications: "System Notifications",
      alertNotifications: "Alert Notifications",
      saveSettings: "Save Settings",
      settingsSaved: "Settings saved successfully"
    },
    vi: {
      title: "Thông Báo",
      subtitle: "Thông báo hệ thống thời gian thực và cảnh báo",
      search: "Tìm kiếm thông báo...",
      filter: "Lọc",
      markAllRead: "Đánh Dấu Tất Cả Đã Đọc",
      clearAll: "Xóa Tất Cả",
      settings: "Cài Đặt",
      all: "Tất Cả",
      unread: "Chưa Đọc",
      read: "Đã Đọc",
      archived: "Đã Lưu Trữ",
      priority: "Mức Độ Ưu Tiên",
      type: "Loại",
      status: "Trạng Thái",
      noNotifications: "Không tìm thấy thông báo",
      loading: "Đang tải thông báo...",
      emailNotifications: "Thông Báo Email",
      pushNotifications: "Thông Báo Push",
      soundNotifications: "Thông Báo Âm Thanh",
      orderNotifications: "Thông Báo Đơn Hàng",
      userNotifications: "Thông Báo Người Dùng",
      productNotifications: "Thông Báo Sản Phẩm",
      systemNotifications: "Thông Báo Hệ Thống",
      alertNotifications: "Thông Báo Cảnh Báo",
      saveSettings: "Lưu Cài Đặt",
      settingsSaved: "Đã lưu cài đặt thành công"
    },
    ja: {
      title: "通知",
      subtitle: "リアルタイムシステム通知とアラート",
      search: "通知を検索...",
      filter: "フィルター",
      markAllRead: "すべて既読にする",
      clearAll: "すべてクリア",
      settings: "設定",
      all: "すべて",
      unread: "未読",
      read: "既読",
      archived: "アーカイブ",
      priority: "優先度",
      type: "タイプ",
      status: "ステータス",
      noNotifications: "通知が見つかりません",
      loading: "通知を読み込み中...",
      emailNotifications: "メール通知",
      pushNotifications: "プッシュ通知",
      soundNotifications: "音声通知",
      orderNotifications: "注文通知",
      userNotifications: "ユーザー通知",
      productNotifications: "商品通知",
      systemNotifications: "システム通知",
      alertNotifications: "アラート通知",
      saveSettings: "設定を保存",
      settingsSaved: "設定が正常に保存されました"
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
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Notification</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Notification title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Notification message"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value: string) => setFormData(prev => ({ ...prev, type: value as 'info' | 'success' | 'warning' | 'error' }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value: string) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="order">Order</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="actionUrl">Action URL (optional)</Label>
                    <Input
                      id="actionUrl"
                      value={formData.actionUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                      placeholder="/admin/orders"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expiresAt">Expires At (optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNotification}>
                    Create Notification
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {selectedNotifications.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Selected as Read
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </>
            )}
            
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {t.markAllRead}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4 mr-2" />
              {t.settings}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t.clearAll}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard - Moved to top */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</CardTitle>
              <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{notifications.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Unread</CardTitle>
              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {unreadCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Errors & Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {notifications.filter(n => n.type === 'error' || n.type === 'warning').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Today</CardTitle>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {notifications.filter(n => {
                  const today = new Date();
                  const notificationDate = new Date(n.createdAt);
                  return notificationDate.toDateString() === today.toDateString();
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="unread">{t.unread}</SelectItem>
                <SelectItem value="read">{t.read}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t.settings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{t.emailNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.email}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>{t.pushNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.push}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <span>{t.soundNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.sound}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sound: checked }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>{t.orderNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.orderNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, orderNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{t.userNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.userNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, userNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{t.productNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.productNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, productNotifications: checked }))}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => {
                  setShowSettings(false);
                  toast({
                    title: t.settingsSaved,
                  });
                }}>
                  {t.saveSettings}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card key={notification._id} className={`transition-all duration-200 ${
                !notification.read 
                  ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                  : 'border-l-4 border-l-transparent'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => toggleNotificationSelection(notification._id)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-medium ${
                              !notification.read 
                                ? 'text-blue-900 dark:text-blue-100' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {notification.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryLabel(notification.category)}
                            </Badge>
                          </div>
                          <p className={`text-sm ${
                            !notification.read 
                              ? 'text-blue-700 dark:text-blue-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(notification.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(notification.category)}
                              {getCategoryLabel(notification.category)}
                            </span>
                            {notification.actionUrl && (
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Zap className="h-3 w-3" />
                                Has Action
                              </span>
                            )}
                            {notification.expiresAt && (
                              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                <Clock className="h-3 w-3" />
                                Expires {new Date(notification.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(notification)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t.noNotifications}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Notification</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-message">Message</Label>
                <Textarea
                  id="edit-message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: string) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-actionUrl">Action URL (optional)</Label>
                <Input
                  id="edit-actionUrl"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                  placeholder="/admin/orders"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-expiresAt">Expires At (optional)</Label>
                <Input
                  id="edit-expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditNotification}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
