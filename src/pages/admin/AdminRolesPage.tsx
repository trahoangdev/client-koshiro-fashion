import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Users,
  Loader2,
  Filter,
  Copy,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  MoreHorizontal,
  Grid3X3,
  List,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Settings,
  UserCheck,
  Lock,
  Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import RoleForm from "@/components/admin/RoleForm";
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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getUserRoleName } from "@/contexts";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { api, Role, Permission } from "@/lib/api";


interface RoleStats {
  total: number;
  active: number;
  system: number;
  userCreated: number;
  distribution: Array<{
  _id: string;
  name: string;
  userCount: number;
    level: number;
  isActive: boolean;
  }>;
}

export default function AdminRolesPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("level");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState<string | null>(null);

  const translations = {
    vi: {
      title: "Quản lý Vai trò",
      subtitle: "Quản lý vai trò và quyền hạn của người dùng",
      addRole: "Thêm Vai trò",
      search: "Tìm kiếm vai trò...",
      all: "Tất cả",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      system: "Hệ thống",
      userCreated: "Người dùng tạo",
      level: "Cấp độ",
      users: "Người dùng",
      permissions: "Quyền hạn",
      actions: "Hành động",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      clone: "Sao chép",
      activate: "Kích hoạt",
      deactivate: "Vô hiệu hóa",
      noRoles: "Không có vai trò nào",
      loading: "Đang tải...",
      error: "Lỗi",
      success: "Thành công",
      createSuccess: "Vai trò đã được tạo thành công",
      updateSuccess: "Vai trò đã được cập nhật thành công",
      deleteSuccess: "Vai trò đã được xóa thành công",
      createError: "Lỗi khi tạo vai trò",
      updateError: "Lỗi khi cập nhật vai trò",
      deleteError: "Lỗi khi xóa vai trò",
      loadError: "Lỗi khi tải dữ liệu",
      confirmDelete: "Xác nhận xóa",
      deleteConfirmMessage: "Bạn có chắc chắn muốn xóa vai trò này? Hành động này không thể hoàn tác.",
      deleteAction: "Xóa",
      cancelAction: "Hủy",
      cannotDeleteSystem: "Không thể xóa vai trò hệ thống",
      cannotDeleteWithUsers: "Không thể xóa vai trò có người dùng",
      createRole: "Tạo vai trò",
      editRole: "Chỉnh sửa vai trò",
      viewRole: "Xem chi tiết",
      cloneSuccess: "Sao chép thành công",
      cloneSuccessDesc: "Vai trò đã được sao chép",
      cloneError: "Lỗi sao chép",
      cloneErrorDesc: "Không thể sao chép vai trò",
      stats: {
        total: "Tổng số",
        active: "Hoạt động",
        system: "Hệ thống",
        userCreated: "Người dùng tạo"
      }
    },
    en: {
      title: "Role Management",
      subtitle: "Manage user roles and permissions",
      addRole: "Add Role",
      search: "Search roles...",
      all: "All",
      active: "Active",
      inactive: "Inactive",
      system: "System",
      userCreated: "User Created",
      level: "Level",
      users: "Users",
      permissions: "Permissions",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      clone: "Clone",
      activate: "Activate",
      deactivate: "Deactivate",
      noRoles: "No roles found",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      createSuccess: "Role created successfully",
      updateSuccess: "Role updated successfully",
      deleteSuccess: "Role deleted successfully",
      createError: "Error creating role",
      updateError: "Error updating role",
      deleteError: "Error deleting role",
      loadError: "Error loading data",
      confirmDelete: "Confirm Delete",
      deleteConfirmMessage: "Are you sure you want to delete this role? This action cannot be undone.",
      deleteAction: "Delete",
      cancelAction: "Cancel",
      cannotDeleteSystem: "Cannot delete system role",
      cannotDeleteWithUsers: "Cannot delete role with users",
      createRole: "Create Role",
      editRole: "Edit Role",
      viewRole: "View Details",
      cloneSuccess: "Clone Successful",
      cloneSuccessDesc: "Role has been cloned",
      cloneError: "Clone Error",
      cloneErrorDesc: "Failed to clone role",
      stats: {
        total: "Total",
        active: "Active",
        system: "System",
        userCreated: "User Created"
      }
    },
    ja: {
      title: "ロール管理",
      subtitle: "ユーザーロールと権限の管理",
      addRole: "ロール追加",
      search: "ロールを検索...",
      all: "すべて",
      active: "アクティブ",
      inactive: "非アクティブ",
      system: "システム",
      userCreated: "ユーザー作成",
      level: "レベル",
      users: "ユーザー",
      permissions: "権限",
      actions: "アクション",
      edit: "編集",
      delete: "削除",
      clone: "複製",
      activate: "有効化",
      deactivate: "無効化",
      noRoles: "ロールが見つかりません",
      loading: "読み込み中...",
      error: "エラー",
      success: "成功",
      createSuccess: "ロールが正常に作成されました",
      updateSuccess: "ロールが正常に更新されました",
      deleteSuccess: "ロールが正常に削除されました",
      createError: "ロール作成エラー",
      updateError: "ロール更新エラー",
      deleteError: "ロール削除エラー",
      loadError: "データ読み込みエラー",
      confirmDelete: "削除確認",
      deleteConfirmMessage: "このロールを削除してもよろしいですか？この操作は元に戻せません。",
      deleteAction: "削除",
      cancelAction: "キャンセル",
      cannotDeleteSystem: "システムロールは削除できません",
      cannotDeleteWithUsers: "ユーザーがいるロールは削除できません",
      createRole: "ロール作成",
      editRole: "ロール編集",
      viewRole: "詳細表示",
      cloneSuccess: "クローン成功",
      cloneSuccessDesc: "ロールがクローンされました",
      cloneError: "クローンエラー",
      cloneErrorDesc: "ロールのクローンに失敗しました",
      stats: {
        total: "合計",
        active: "アクティブ",
        system: "システム",
        userCreated: "ユーザー作成"
      }
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      const userRole = getUserRoleName(user);
      if (!isAuthenticated || (userRole !== 'Admin' && userRole !== 'Super Admin')) {
        navigate("/admin/login");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rolesResponse, statsResponse] = await Promise.all([
        api.getRoles(),
        api.getRoleStats()
      ]);
      setRoles(rolesResponse.roles);
      setStats(statsResponse.stats as unknown as RoleStats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: t.loadError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t.loadError, toast]);

  // CRUD Functions
  const handleCreateRole = () => {
    setEditingRole(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsEditDialogOpen(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      setIsDeleting(roleId);
      await api.deleteRole(roleId);
      toast({
        title: t.deleteSuccess,
        description: t.deleteSuccess,
      });
      loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: t.deleteError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCloneRole = async (role: Role) => {
    try {
      setIsCloning(role._id);
      const response = await api.cloneRole(role._id, {
        name: `${role.name} (Copy)`,
        nameEn: role.nameEn ? `${role.nameEn} (Copy)` : undefined,
        nameJa: role.nameJa ? `${role.nameJa} (Copy)` : undefined,
        level: role.level
      });
      
      toast({
        title: t.cloneSuccess,
        description: t.cloneSuccessDesc,
      });
      loadData();
    } catch (error) {
      console.error('Error cloning role:', error);
      toast({
        title: t.cloneError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsCloning(null);
    }
  };

  const handleViewRole = (role: Role) => {
    navigate(`/admin/roles/${role._id}`);
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingRole(null);
    loadData();
  };

  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingRole(null);
  };

  // Load data
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const userRole = getUserRoleName(user);
      if (userRole === 'Admin' || userRole === 'Super Admin') {
        loadData();
      }
    }
  }, [authLoading, isAuthenticated, user, loadData]);

  // Filter and sort roles
  useEffect(() => {
    let filtered = roles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "active":
          filtered = filtered.filter(role => role.isActive);
          break;
        case "inactive":
          filtered = filtered.filter(role => !role.isActive);
          break;
        case "system":
          filtered = filtered.filter(role => role.isSystem);
          break;
        case "userCreated":
          filtered = filtered.filter(role => !role.isSystem);
          break;
      }
    }

    // Filter by level
    if (levelFilter !== "all") {
      const level = parseInt(levelFilter);
      filtered = filtered.filter(role => role.level >= level);
    }

    // Sort roles
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "level":
          comparison = a.level - b.level;
          break;
        case "users":
          comparison = (a.userCount || 0) - (b.userCount || 0);
          break;
        case "permissions":
          comparison = a.permissions.length - b.permissions.length;
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = a.level - b.level;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredRoles(filtered);
  }, [roles, searchTerm, statusFilter, levelFilter, sortBy, sortOrder]);


  const handleToggleRoleStatus = async (roleId: string, isActive: boolean) => {
    try {
      await api.updateRole(roleId, { isActive });
      toast({
        title: t.updateSuccess,
      });
      loadData();
    } catch (error) {
      console.error('Error updating role status:', error);
      toast({
        title: t.updateError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };


  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setIsEditDialogOpen(true);
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

  if (!isAuthenticated) {
    return null;
  }
  
  const userRole = typeof user?.role === 'string' ? user.role : (user?.role as { name: string })?.name;
  if (userRole !== 'Admin' && userRole !== 'Super Admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
            <Button onClick={handleCreateRole}>
              <Plus className="h-4 w-4 mr-2" />
            {t.addRole}
            </Button>
        </div>

      {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.total}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.active}</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.system}</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.system}</div>
          </CardContent>
        </Card>
        <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.userCreated}</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userCreated}</div>
          </CardContent>
        </Card>
      </div>
        )}

        {/* Filters and Search */}
      <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="inactive">{t.inactive}</SelectItem>
                  <SelectItem value="system">{t.system}</SelectItem>
                  <SelectItem value="userCreated">{t.userCreated}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="90">90+ (Admin)</SelectItem>
                  <SelectItem value="80">80+ (Manager)</SelectItem>
                  <SelectItem value="70">70+ (Editor)</SelectItem>
                  <SelectItem value="60">60+ (Viewer)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level">{t.level}</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="users">{t.users}</SelectItem>
                  <SelectItem value="permissions">{t.permissions}</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
              </SelectContent>
            </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </Button>
          </div>
        </CardContent>
      </Card>

        {/* Roles Grid/List */}
        {filteredRoles.length === 0 ? (
      <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noRoles}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || levelFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first role"}
              </p>
              <Button onClick={handleCreateRole}>
                <Plus className="h-4 w-4 mr-2" />
                {t.addRole}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRoles.map((role) => (
              <Card key={role._id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Level {role.level}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          System
                          </Badge>
                        )}
                      <Badge variant={role.isActive ? "default" : "secondary"}>
                        {role.isActive ? (
                          <><Unlock className="h-3 w-3 mr-1" /> Active</>
                        ) : (
                          <><Lock className="h-3 w-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </div>
                      </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {role.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                      {role.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{role.userCount || 0} users</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>{role.permissions.length} permissions</span>
                      </div>
                      </div>
                      </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewRole(role)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t.viewRole}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditRole(role)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.edit}
                          </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCloneRole(role)}>
                          <Copy className="h-4 w-4 mr-2" />
                          {t.clone}
                          </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleRoleStatus(role._id, !role.isActive)}
                        >
                          {role.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              {t.deactivate}
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              {t.activate}
                            </>
                          )}
                          </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              disabled={role.isSystem || (role.userCount && role.userCount > 0)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t.delete}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
                              <AlertDialogTitle>{t.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
                                {role.isSystem 
                                  ? t.cannotDeleteSystem
                                  : role.userCount && role.userCount > 0
                                  ? t.cannotDeleteWithUsers
                                  : t.deleteConfirmMessage
                                }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
                              <AlertDialogCancel>{t.cancelAction}</AlertDialogCancel>
            <AlertDialogAction
                                onClick={() => handleDeleteRole(role._id)}
                                className="bg-destructive hover:bg-destructive/90"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
              </div>
                </CardContent>
              </Card>
                  ))}
                </div>
        )}

        {/* Create/Edit Role Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingRole(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? t.editRole : t.createRole}
              </DialogTitle>
            </DialogHeader>
            <RoleForm
              role={editingRole || undefined}
              mode={editingRole ? 'edit' : 'create'}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
