import { useState, useEffect, useCallback } from "react";
import { 
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  Loader2,
  Save,
  X,
  MoreHorizontal,
  Eye,
  Copy,
  Download,
  RefreshCw,
  SortAsc,
  SortDesc,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Package,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
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
import { Category } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";
import CloudinaryImage from "@/components/shared/CloudinaryImage";
import CloudinaryImageUpload from "@/components/shared/CloudinaryImageUpload";
import CategoryFormSimple from "@/components/admin/CategoryFormSimple";
import { CategoryFormData } from "@/components/admin/CategoryFormSimple";

// Helper function to render category image
const renderCategoryImage = (category: Category, className: string = "w-10 h-10") => {
  // Priority: Cloudinary images > Legacy image > Placeholder
  if (category.cloudinaryImages && category.cloudinaryImages.length > 0) {
    const cloudinaryImage = category.cloudinaryImages[0];
    return (
      <div className={`${className} rounded-lg overflow-hidden bg-muted`}>
        <CloudinaryImage
          publicId={cloudinaryImage.publicId}
          secureUrl={cloudinaryImage.secureUrl}
          responsiveUrls={cloudinaryImage.responsiveUrls}
          alt={category.name}
          className="w-full h-full object-cover"
          size="thumbnail"
          loading="lazy"
        />
      </div>
    );
  }
  
  // Fallback to legacy image
  if (category.image) {
    return (
      <div className={`${className} rounded-lg overflow-hidden bg-muted`}>
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  
  // Placeholder when no images
  return (
    <div className={`${className} bg-primary/10 rounded-lg flex items-center justify-center`}>
      <Folder className="h-5 w-5 text-primary" />
    </div>
  );
};

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  withProducts: number;
  topCategories: Array<{ name: string; productCount: number; revenue: number }>;
}

export default function AdminCategories() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [stats, setStats] = useState<CategoryStats>({
    total: 0,
    active: 0,
    inactive: 0,
    withProducts: 0,
    topCategories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { language } = useLanguage();


  const translations = {
    vi: {
      title: "Quản lý Danh Mục",
      subtitle: "Quản lý tất cả danh mục sản phẩm",
      searchPlaceholder: "Tìm kiếm danh mục...",
      filterByStatus: "Lọc theo trạng thái",
      sortBy: "Sắp xếp theo",
      allStatuses: "Tất cả trạng thái",
      name: "Tên",
      description: "Mô tả",
      slug: "Slug",
      status: "Trạng thái",
      products: "Sản phẩm",
      actions: "Thao tác",
      create: "Tạo mới",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      view: "Xem chi tiết",
      copy: "Sao chép",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      noCategories: "Không tìm thấy danh mục nào",
      loading: "Đang tải...",
      errorLoading: "Lỗi tải dữ liệu",
      errorLoadingDesc: "Không thể tải danh sách danh mục",
      createCategory: "Tạo Danh Mục Mới",
      editCategory: "Chỉnh Sửa Danh Mục",
      deleteCategory: "Xóa Danh Mục",
      deleteConfirm: "Bạn có chắc chắn muốn xóa danh mục này?",
      deleteWarning: "Hành động này không thể hoàn tác.",
      save: "Lưu",
      cancel: "Hủy",
      parentCategory: "Danh mục cha",
      noParent: "Không có danh mục cha",
      metaTitle: "Meta Title",
      metaDescription: "Meta Description",
      image: "Hình ảnh",
      totalCategories: "Tổng danh mục",
      activeCategories: "Danh mục hoạt động",
      categoriesWithProducts: "Danh mục có sản phẩm",
      topCategories: "Danh mục hàng đầu"
    },
    en: {
      title: "Category Management",
      subtitle: "Manage all product categories",
      searchPlaceholder: "Search categories...",
      filterByStatus: "Filter by status",
      sortBy: "Sort by",
      allStatuses: "All statuses",
      name: "Name",
      description: "Description",
      slug: "Slug",
      status: "Status",
      products: "Products",
      actions: "Actions",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      view: "View Details",
      copy: "Copy",
      active: "Active",
      inactive: "Inactive",
      noCategories: "No categories found",
      loading: "Loading...",
      errorLoading: "Error loading data",
      errorLoadingDesc: "Could not load category list",
      createCategory: "Create New Category",
      editCategory: "Edit Category",
      deleteCategory: "Delete Category",
      deleteConfirm: "Are you sure you want to delete this category?",
      deleteWarning: "This action cannot be undone.",
      save: "Save",
      cancel: "Cancel",
      parentCategory: "Parent Category",
      noParent: "No parent category",
      metaTitle: "Meta Title",
      metaDescription: "Meta Description",
      image: "Image",
      totalCategories: "Total Categories",
      activeCategories: "Active Categories",
      categoriesWithProducts: "Categories with Products",
      topCategories: "Top Categories"
    },
    ja: {
      title: "カテゴリ管理",
      subtitle: "すべての商品カテゴリを管理",
      searchPlaceholder: "カテゴリを検索...",
      filterByStatus: "ステータスで絞り込み",
      sortBy: "並び替え",
      allStatuses: "すべてのステータス",
      name: "名前",
      description: "説明",
      slug: "スラッグ",
      status: "ステータス",
      products: "商品",
      actions: "操作",
      create: "作成",
      edit: "編集",
      delete: "削除",
      view: "詳細を見る",
      copy: "コピー",
      active: "アクティブ",
      inactive: "非アクティブ",
      noCategories: "カテゴリが見つかりません",
      loading: "読み込み中...",
      errorLoading: "データ読み込みエラー",
      errorLoadingDesc: "カテゴリリストを読み込めませんでした",
      createCategory: "新しいカテゴリを作成",
      editCategory: "カテゴリを編集",
      deleteCategory: "カテゴリを削除",
      deleteConfirm: "このカテゴリを削除してもよろしいですか？",
      deleteWarning: "この操作は元に戻せません。",
      save: "保存",
      cancel: "キャンセル",
      parentCategory: "親カテゴリ",
      noParent: "親カテゴリなし",
      metaTitle: "メタタイトル",
      metaDescription: "メタ説明",
      image: "画像",
      totalCategories: "総カテゴリ数",
      activeCategories: "アクティブカテゴリ",
      categoriesWithProducts: "商品があるカテゴリ",
      topCategories: "トップカテゴリ"
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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getCategories();
      setCategories(response.categories);
      
      // Calculate stats
      const categoryStats: CategoryStats = {
        total: response.categories.length,
        active: response.categories.filter(c => c.isActive).length,
        inactive: response.categories.filter(c => !c.isActive).length,
        withProducts: response.categories.filter(c => (c.productCount || 0) > 0).length,
        topCategories: response.categories
          .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
          .slice(0, 5)
          .map(c => ({
            name: c.name,
            productCount: c.productCount || 0,
            revenue: 0 // Category doesn't have revenue property
          }))
      };
      setStats(categoryStats);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: t.errorLoading,
        description: t.errorLoadingDesc,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [t.errorLoading, t.errorLoadingDesc, toast]);

  const filterAndSortCategories = useCallback(() => {
    let filtered = categories;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(category => 
        selectedStatus === "active" ? category.isActive : !category.isActive
      );
    }

    // Sort categories
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "productCount":
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCategories(filtered);
  }, [categories, searchTerm, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterAndSortCategories();
  }, [filterAndSortCategories]);

  const handleCreateCategory = async (categoryData: CategoryFormData) => {
    try {
      setIsSaving(true);
      
      // Clean up the data before sending
      const cleanData = {
        ...categoryData,
        parentId: categoryData.parentId && categoryData.parentId !== "" ? categoryData.parentId : undefined
      };
      
      await api.createCategory(cleanData);
      toast({
        title: "Category created successfully",
      });
      setShowCreateDialog(false);
      loadData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error creating category",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategory = async (categoryData: CategoryFormData) => {
    if (!editingCategory) return;
    
    try {
      setIsSaving(true);
      
      // Clean up the data before sending
      const cleanData = {
        ...categoryData,
        parentId: categoryData.parentId && categoryData.parentId !== "" ? categoryData.parentId : undefined
      };
      
      await api.updateCategory(editingCategory._id, cleanData);
      toast({
        title: "Category updated successfully",
      });
      setShowEditDialog(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error updating category",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsDeleting(true);
      await api.deleteCategory(categoryToDelete._id);
      toast({
        title: "Category deleted successfully",
      });
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error deleting category",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t.active, variant: "default" as const, icon: CheckCircle },
      inactive: { label: t.inactive, variant: "secondary" as const, icon: XCircle }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US'
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
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.create}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalCategories}</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activeCategories}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.categoriesWithProducts}</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.withProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.topCategories}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topCategories.length}</div>
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
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allStatuses}</SelectItem>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">{t.name}</SelectItem>
                    <SelectItem value="productCount">{t.products}</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
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

        {/* Categories Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {renderCategoryImage(category)}
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.slug}</p>
                    </div>
                  </div>
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
                      <DropdownMenuItem onClick={() => {
                        setEditingCategory(category);
                        setShowEditDialog(true);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        {t.copy}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setCategoryToDelete(category);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(category.isActive ? 'active' : 'inactive')}
                    <Badge variant="outline">
                      {category.productCount || 0} {t.products}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(category.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noCategories}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "No categories have been created yet"}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t.create}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Category Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.createCategory}</DialogTitle>
            </DialogHeader>
            <CategoryFormSimple
              categories={categories}
              onSubmit={handleCreateCategory}
              onCancel={() => setShowCreateDialog(false)}
              isSubmitting={isSaving}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.editCategory}</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <CategoryFormSimple
                initialData={editingCategory}
                categories={categories}
                onSubmit={handleUpdateCategory}
                onCancel={() => setShowEditDialog(false)}
                isSubmitting={isSaving}
                mode="edit"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Category Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.deleteCategory}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.deleteConfirm}
                <br />
                {t.deleteWarning}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                {t.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
} 