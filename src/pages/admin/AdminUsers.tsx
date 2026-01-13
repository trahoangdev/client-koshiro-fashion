import { useState, useEffect } from "react";
import { 
  Search,
  Filter,
  Eye,
  User,
  Loader2,
  Calendar,
  Mail,
  Phone,
  Download,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Shield,
  ShieldCheck,
  ShieldX,
  MapPin,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Filter as FilterIcon,
  SortAsc,
  SortDesc
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { useNavigate } from "react-router-dom";
import { User as UserType } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";
import UserForm from "@/components/admin/UserForm";
import { exportImportService } from "@/lib/exportImportService";

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  customers: number;
  admins: number;
  newThisMonth: number;
  totalRevenue: number;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
    customers: 0,
    admins: 0,
    newThisMonth: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const translations = {
    vi: {
      title: "Quản lý Người dùng",
      subtitle: "Quản lý tất cả người dùng và tài khoản",
      searchPlaceholder: "Tìm kiếm người dùng, email...",
      filterByRole: "Lọc theo vai trò",
      filterByStatus: "Lọc theo trạng thái",
      filterByDate: "Lọc theo ngày",
      sortBy: "Sắp xếp theo",
      allRoles: "Tất cả vai trò",
      allStatuses: "Tất cả trạng thái",
      allDates: "Tất cả thời gian",
      customer: "Khách hàng",
      admin: "Quản trị viên",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      blocked: "Bị chặn",
      name: "Tên",
      email: "Email",
      role: "Vai trò",
      status: "Trạng thái",
      orders: "Đơn hàng",
      totalSpent: "Tổng chi tiêu",
      joinDate: "Ngày tham gia",
      actions: "Thao tác",
      view: "Xem chi tiết",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      block: "Chặn",
      unblock: "Bỏ chặn",
      addUser: "Thêm người dùng",
      editUser: "Chỉnh sửa người dùng",
      deleteUser: "Xóa người dùng",
      confirmDelete: "Bạn có chắc chắn muốn xóa người dùng này?",
      deleteSuccess: "Xóa người dùng thành công",
      deleteError: "Lỗi khi xóa người dùng",
      createSuccess: "Tạo người dùng thành công",
      createError: "Lỗi khi tạo người dùng",
      updateSuccess: "Cập nhật người dùng thành công",
      updateError: "Lỗi khi cập nhật người dùng",
      loadError: "Lỗi khi tải dữ liệu",
      noUsers: "Không tìm thấy người dùng nào",
      loading: "Đang tải...",
      errorLoading: "Lỗi tải dữ liệu",
      errorLoadingDesc: "Không thể tải danh sách người dùng",
      bulkActions: "Thao tác hàng loạt",
      selectAll: "Chọn tất cả",
      deselectAll: "Bỏ chọn tất cả",
      export: "Xuất dữ liệu",
      refresh: "Làm mới",
      today: "Hôm nay",
      thisWeek: "Tuần này",
      thisMonth: "Tháng này",
      lastMonth: "Tháng trước",
      custom: "Tùy chỉnh",
      userName: "Tên người dùng",
      userRole: "Vai trò",
      userStatus: "Trạng thái"
    },
    en: {
      title: "User Management",
      subtitle: "Manage all users and accounts",
      searchPlaceholder: "Search users, emails...",
      filterByRole: "Filter by role",
      filterByStatus: "Filter by status",
      filterByDate: "Filter by date",
      sortBy: "Sort by",
      allRoles: "All roles",
      allStatuses: "All statuses",
      allDates: "All time",
      customer: "Customer",
      admin: "Admin",
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      orders: "Orders",
      totalSpent: "Total Spent",
      joinDate: "Join Date",
      actions: "Actions",
      view: "View Details",
      edit: "Edit",
      delete: "Delete",
      block: "Block",
      unblock: "Unblock",
      addUser: "Add User",
      editUser: "Edit User",
      deleteUser: "Delete User",
      confirmDelete: "Are you sure you want to delete this user?",
      deleteSuccess: "User deleted successfully",
      deleteError: "Error deleting user",
      createSuccess: "User created successfully",
      createError: "Error creating user",
      updateSuccess: "User updated successfully",
      updateError: "Error updating user",
      loadError: "Error loading data",
      noUsers: "No users found",
      loading: "Loading...",
      errorLoading: "Error loading data",
      errorLoadingDesc: "Could not load user list",
      bulkActions: "Bulk Actions",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      export: "Export",
      refresh: "Refresh",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      userName: "User Name",
      userRole: "Role",
      userStatus: "Status"
    },
    ja: {
      title: "ユーザー管理",
      subtitle: "すべてのユーザーとアカウントを管理",
      searchPlaceholder: "ユーザー、メールを検索...",
      filterByRole: "役割で絞り込み",
      filterByStatus: "ステータスで絞り込み",
      filterByDate: "日付で絞り込み",
      sortBy: "並び替え",
      allRoles: "すべての役割",
      allStatuses: "すべてのステータス",
      allDates: "すべての期間",
      customer: "顧客",
      admin: "管理者",
      active: "アクティブ",
      inactive: "非アクティブ",
      blocked: "ブロック済み",
      name: "名前",
      email: "メール",
      role: "役割",
      status: "ステータス",
      orders: "注文",
      totalSpent: "総支出",
      joinDate: "参加日",
      actions: "操作",
      view: "詳細を見る",
      edit: "編集",
      delete: "削除",
      block: "ブロック",
      unblock: "ブロック解除",
      addUser: "ユーザー追加",
      editUser: "ユーザー編集",
      deleteUser: "ユーザー削除",
      confirmDelete: "このユーザーを削除してもよろしいですか？",
      deleteSuccess: "ユーザーが正常に削除されました",
      deleteError: "ユーザーの削除中にエラーが発生しました",
      createSuccess: "ユーザーが正常に作成されました",
      createError: "ユーザーの作成中にエラーが発生しました",
      updateSuccess: "ユーザーが正常に更新されました",
      updateError: "ユーザーの更新中にエラーが発生しました",
      loadError: "データの読み込み中にエラーが発生しました",
      noUsers: "ユーザーが見つかりません",
      loading: "読み込み中...",
      errorLoading: "データ読み込みエラー",
      errorLoadingDesc: "ユーザーリストを読み込めませんでした",
      bulkActions: "一括操作",
      selectAll: "すべて選択",
      deselectAll: "選択解除",
      export: "エクスポート",
      refresh: "更新",
      today: "今日",
      thisWeek: "今週",
      thisMonth: "今月",
      userName: "ユーザー名",
      userRole: "役割",
      userStatus: "ステータス"
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
    filterAndSortUsers();
  }, [users, searchTerm, selectedRole, selectedStatus, dateRange, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAdminUsers({ page: 1, limit: 100 });
      setUsers(response.data);
      
      // Calculate stats
      const userStats: UserStats = {
        total: response.data.length,
        active: response.data.filter(u => u.status === 'active').length,
        inactive: response.data.filter(u => u.status === 'inactive').length,
        blocked: response.data.filter(u => u.status === 'blocked').length,
        customers: response.data.filter(u => u.role === 'customer').length,
        admins: response.data.filter(u => u.role === 'admin').length,
        newThisMonth: response.data.filter(u => {
          const userDate = new Date(u.createdAt);
          const now = new Date();
          return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
        }).length,
        totalRevenue: response.data.reduce((sum, u) => sum + (u.totalOrders || 0), 0)
      };
      setStats(userStats);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: t.errorLoading,
        description: t.errorLoadingDesc,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      const userDate = new Date();
      
      switch (dateRange) {
        case "today":
          filtered = filtered.filter(user => {
            const userDate = new Date(user.createdAt);
            return userDate.toDateString() === now.toDateString();
          });
          break;
        case "thisWeek": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(user => {
            const userDate = new Date(user.createdAt);
            return userDate >= weekAgo;
          });
          break;
        }
        case "thisMonth": {
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(user => {
            const userDate = new Date(user.createdAt);
            return userDate >= monthAgo;
          });
          break;
        }
        case "lastMonth": {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(user => {
            const userDate = new Date(user.createdAt);
            return userDate >= lastMonth && userDate < thisMonth;
          });
          break;
        }
      }
    }

    // Sort users
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "email":
          aValue = a.email;
          bValue = b.email;
          break;
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "totalOrders":
          aValue = a.totalOrders || 0;
          bValue = b.totalOrders || 0;
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await api.updateUserStatus(userId, newStatus as 'active' | 'inactive' | 'blocked');
      toast({
        title: "Status updated successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error updating status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await Promise.all(selectedUsers.map(id => api.updateUserStatus(id, newStatus as 'active' | 'inactive' | 'blocked')));
      toast({
        title: `${selectedUsers.length} users updated successfully`,
      });
      setSelectedUsers([]);
      loadData();
    } catch (error) {
      console.error('Error bulk updating users:', error);
      toast({
        title: "Error updating users",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateUser = async (formData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: 'customer' | 'admin';
    status: 'active' | 'inactive' | 'blocked';
    addresses: Array<{
      type: 'shipping' | 'billing';
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      isDefault: boolean;
    }>;
    preferences: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      marketingEmails: boolean;
      language: string;
      currency: string;
    };
  }) => {
    try {
      setIsSubmitting(true);
      // Transform formData to match API interface
      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password || '',
        phone: formData.phone,
        role: formData.role,
        status: formData.status
      };
      await api.createUser(apiData);
      toast({
        title: t.createSuccess,
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: t.createError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (formData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: 'customer' | 'admin';
    status: 'active' | 'inactive' | 'blocked';
    addresses: Array<{
      type: 'shipping' | 'billing';
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      isDefault: boolean;
    }>;
    preferences: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      marketingEmails: boolean;
      language: string;
      currency: string;
    };
  }) => {
    if (!editingUser) return;
    
    try {
      setIsSubmitting(true);
      // Transform formData to match API interface
      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password || '',
        phone: formData.phone,
        role: formData.role,
        status: formData.status
      };
      await api.updateUser(editingUser._id, apiData);
      toast({
        title: t.updateSuccess,
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: t.updateError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      toast({
        title: t.deleteSuccess,
      });
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: t.deleteError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t.active, variant: "default" as const, icon: CheckCircle },
      inactive: { label: t.inactive, variant: "secondary" as const, icon: Clock },
      blocked: { label: t.blocked, variant: "destructive" as const, icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: t.admin, variant: "default" as const, icon: Shield },
      customer: { label: t.customer, variant: "secondary" as const, icon: User }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.customer;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US'
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const openEditDialog = (user: UserType) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  // Export handler
  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    try {
      setIsExporting(true);
      // Transform users data for export
      const exportData = filteredUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        totalOrders: user.totalOrders,
        orderCount: user.orderCount,
        totalSpent: user.totalSpent,
        address: user.address || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      const job = await exportImportService.startExportJob('customers', format, exportData);
      
      toast({
        title: "Export Started",
        description: `Exporting ${filteredUsers.length} users to ${format.toUpperCase()}`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getExportJob(job.id);
        if (updatedJob?.status === 'completed' && updatedJob.downloadUrl) {
          const link = document.createElement('a');
          link.href = updatedJob.downloadUrl;
          const fileExtension = format === 'excel' ? 'xlsx' : format;
          link.download = `users_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: "Export Completed",
            description: `Users exported successfully to ${format.toUpperCase()}`,
          });
          setIsExporting(false);
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: "Export Failed",
            description: updatedJob.error || "Failed to export users",
            variant: "destructive",
          });
          setIsExporting(false);
        } else {
          setTimeout(checkJob, 1000);
        }
      };
      
      checkJob();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to start export",
        variant: "destructive",
      });
      setIsExporting(false);
    }
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
            <Button variant="outline" size="sm" onClick={() => loadData()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : t.export}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addUser}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t.addUser}</DialogTitle>
                </DialogHeader>
                <UserForm
                  onSubmit={handleCreateUser}
                  isSubmitting={isSubmitting}
                  mode="create"
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
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
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterByRole} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allRoles}</SelectItem>
                    <SelectItem value="customer">{t.customer}</SelectItem>
                    <SelectItem value="admin">{t.admin}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allStatuses}</SelectItem>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                    <SelectItem value="blocked">{t.blocked}</SelectItem>
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
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">{t.joinDate}</SelectItem>
                    <SelectItem value="name">{t.userName}</SelectItem>
                    <SelectItem value="email">{t.email}</SelectItem>
                    <SelectItem value="role">{t.userRole}</SelectItem>
                    <SelectItem value="status">{t.userStatus}</SelectItem>
                    <SelectItem value="totalOrders">{t.orders}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedUsers.length} users selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedUsers.length === filteredUsers.length ? t.deselectAll : t.selectAll}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')}>
                        {t.active}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('inactive')}>
                        {t.inactive}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('blocked')}>
                        {t.blocked}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4">{t.name}</th>
                    <th className="text-left p-4">{t.email}</th>
                    <th className="text-left p-4">{t.role}</th>
                    <th className="text-left p-4">{t.status}</th>
                    <th className="text-left p-4">{t.orders}</th>
                    <th className="text-left p-4">{t.joinDate}</th>
                    <th className="text-left p-4">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onCheckedChange={() => handleSelectUser(user._id)}
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.phone}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}

                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-center">
                          <div className="font-medium">{user.totalOrders || 0}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrencyForDisplay(user.totalOrders || 0)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{formatDate(user.createdAt)}</div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              {t.view}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUpdateUserStatus(user._id, 'active')}>
                              {t.active}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateUserStatus(user._id, 'inactive')}>
                              {t.inactive}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateUserStatus(user._id, 'blocked')}>
                              {t.blocked}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t.delete}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t.deleteUser}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t.confirmDelete}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user._id)}>
                                    {t.delete}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noUsers}</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedRole !== "all" || selectedStatus !== "all" || dateRange !== "all"
                  ? "Try adjusting your filters"
                  : "No users have been registered yet"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.editUser}</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <UserForm
                initialData={editingUser}
                onSubmit={handleUpdateUser}
                isSubmitting={isSubmitting}
                mode="edit"
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}