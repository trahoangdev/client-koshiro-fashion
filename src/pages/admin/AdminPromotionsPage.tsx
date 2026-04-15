import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy,
  Eye,
  Calendar,
  Percent,
  Tag,
  Users,
  ShoppingCart,
  Download,
  Upload,
  RefreshCw,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { exportImportService } from "@/lib/exportImportService";
import AdminLayout from "@/components/admin/AdminLayout";

interface Promotion {
  _id: string;
  code: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableUsers?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminPromotionsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const translations = {
    en: {
      title: "Promotion Management",
      subtitle: "Manage discounts, coupons, and promotional campaigns",
      createPromotion: "Create Promotion",
      search: "Search promotions...",
      code: "Code",
      name: "Name",
      type: "Type",
      value: "Value",
      usage: "Usage",
      status: "Status",
      startDate: "Start Date",
      endDate: "End Date",
      actions: "Actions",
      percentage: "Percentage",
      fixed: "Fixed Amount",
      freeShipping: "Free Shipping",
      active: "Active",
      inactive: "Inactive",
      expired: "Expired",
      edit: "Edit",
      delete: "Delete",
      copy: "Copy Code",
      view: "View Details",
      noPromotions: "No promotions found",
      createNew: "Create New Promotion",
      totalPromotions: "Total Promotions",
      activePromotions: "Active Promotions",
      expiredPromotions: "Expired Promotions"
    },
    vi: {
      title: "Quản lý Khuyến mãi",
      subtitle: "Quản lý giảm giá, mã giảm giá và chiến dịch khuyến mãi",
      createPromotion: "Tạo Khuyến mãi",
      search: "Tìm kiếm khuyến mãi...",
      code: "Mã",
      name: "Tên",
      type: "Loại",
      value: "Giá trị",
      usage: "Sử dụng",
      status: "Trạng thái",
      startDate: "Ngày bắt đầu",
      endDate: "Ngày kết thúc",
      actions: "Thao tác",
      percentage: "Phần trăm",
      fixed: "Số tiền cố định",
      freeShipping: "Miễn phí vận chuyển",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      expired: "Hết hạn",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      copy: "Sao chép mã",
      view: "Xem chi tiết",
      noPromotions: "Không tìm thấy khuyến mãi",
      createNew: "Tạo khuyến mãi mới",
      totalPromotions: "Tổng khuyến mãi",
      activePromotions: "Khuyến mãi hoạt động",
      expiredPromotions: "Khuyến mãi hết hạn"
    },
    ja: {
      title: "プロモーション管理",
      subtitle: "割引、クーポン、プロモーションキャンペーンの管理",
      createPromotion: "プロモーション作成",
      search: "プロモーション検索...",
      code: "コード",
      name: "名前",
      type: "タイプ",
      value: "値",
      usage: "使用",
      status: "ステータス",
      startDate: "開始日",
      endDate: "終了日",
      actions: "アクション",
      percentage: "パーセント",
      fixed: "固定金額",
      freeShipping: "送料無料",
      active: "アクティブ",
      inactive: "非アクティブ",
      expired: "期限切れ",
      edit: "編集",
      delete: "削除",
      copy: "コードコピー",
      view: "詳細表示",
      noPromotions: "プロモーションが見つかりません",
      createNew: "新しいプロモーションを作成",
      totalPromotions: "総プロモーション",
      activePromotions: "アクティブプロモーション",
      expiredPromotions: "期限切れプロモーション"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Load promotions data
  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/promotions');
      const data = await response.json();
      
      if (data.success) {
        setPromotions(data.data);
        setFilteredPromotions(data.data);
      } else {
        throw new Error(data.message || 'Failed to load promotions');
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
      
      // Set empty arrays if API fails
      setPromotions([]);
      setFilteredPromotions([]);
      
      toast({
        title: "Error",
        description: "Failed to load promotions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter promotions
  useEffect(() => {
    let filtered = promotions;

    if (searchTerm) {
      filtered = filtered.filter(promo => 
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (promo.nameEn && promo.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (promo.nameJa && promo.nameJa.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(promo => promo.type === filterType);
    }

    if (filterStatus !== "all") {
      const now = new Date();
      filtered = filtered.filter(promo => {
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        
        if (filterStatus === "active") {
          return promo.isActive && startDate <= now && endDate >= now;
        } else if (filterStatus === "inactive") {
          return !promo.isActive;
        } else if (filterStatus === "expired") {
          return endDate < now;
        }
        return true;
      });
    }

    setFilteredPromotions(filtered);
  }, [promotions, searchTerm, filterType, filterStatus]);

  const getPromotionName = (promotion: Promotion) => {
    switch (language) {
      case 'vi': return promotion.name;
      case 'ja': return promotion.nameJa || promotion.name;
      default: return promotion.nameEn || promotion.name;
    }
  };

  const getPromotionDescription = (promotion: Promotion) => {
    switch (language) {
      case 'vi': return promotion.description;
      case 'ja': return promotion.descriptionJa || promotion.description;
      default: return promotion.descriptionEn || promotion.description;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return t.percentage;
      case 'fixed': return t.fixed;
      case 'free_shipping': return t.freeShipping;
      default: return type;
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return <Badge variant="secondary">{t.inactive}</Badge>;
    }

    if (endDate < now) {
      return <Badge variant="destructive">{t.expired}</Badge>;
    }

    if (startDate > now) {
      return <Badge variant="outline">Upcoming</Badge>;
    }

    return <Badge variant="default">{t.active}</Badge>;
  };

  const getValueDisplay = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}%`;
      case 'fixed':
        return formatCurrency(promotion.value, language);
      case 'free_shipping':
        return t.freeShipping;
      default:
        return promotion.value.toString();
    }
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setIsDeleteDialogOpen(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Code "${code}" copied to clipboard`,
    });
  };

  const handleExport = async (format: 'excel' | 'csv' | 'json') => {
    try {
      setIsExporting(true);
      
      // Flatten promotion data for export
      const exportData = filteredPromotions.map(promotion => ({
        'Code': promotion.code,
        'Name (VI)': promotion.name,
        'Name (EN)': promotion.nameEn || '',
        'Name (JA)': promotion.nameJa || '',
        'Description (VI)': promotion.description,
        'Description (EN)': promotion.descriptionEn || '',
        'Description (JA)': promotion.descriptionJa || '',
        'Type': promotion.type,
        'Value': promotion.value,
        'Min Order Amount': promotion.minOrderAmount || 0,
        'Max Discount Amount': promotion.maxDiscountAmount || 0,
        'Usage Limit': promotion.usageLimit || 0,
        'Used Count': promotion.usedCount,
        'Is Active': promotion.isActive ? 'Yes' : 'No',
        'Start Date': promotion.startDate,
        'End Date': promotion.endDate,
        'Created At': promotion.createdAt,
        'Updated At': promotion.updatedAt
      }));

      const job = await exportImportService.startExportJob(
        'promotions',
        format,
        exportData
      );

      toast({
        title: "Export started",
        description: `Promotions will be exported as ${format.toUpperCase()}`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getExportJob(job.id);
        if (updatedJob?.status === 'completed' && updatedJob.downloadUrl) {
          const link = document.createElement('a');
          link.href = updatedJob.downloadUrl;
          const fileExtension = format === 'excel' ? 'xls' : format;
          link.download = `promotions_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(updatedJob.downloadUrl);
          
          toast({
            title: "Export Completed",
            description: `Promotions exported successfully to ${format.toUpperCase()}`,
          });
          setIsExporting(false);
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: "Export Failed",
            description: updatedJob.error || "Failed to export promotions",
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
        title: "Export failed",
        description: "Failed to export promotions",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.csv', '.json'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV or JSON file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImporting(true);
      const job = await exportImportService.startImportJob('promotions', file);
      
      toast({
        title: "Import Started",
        description: `Importing promotions from ${file.name}`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getImportJob(job.id);
        if (updatedJob?.status === 'completed') {
          const successMessage = updatedJob.error ? 
            `Import completed with warnings: ${updatedJob.error}` :
            `Successfully imported ${updatedJob.processedRows} promotions`;
            
          toast({
            title: "Import Completed",
            description: successMessage,
            variant: updatedJob.error ? "default" : "default",
          });
          setIsImporting(false);
          // Reload data to show new promotions
          window.location.reload();
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: "Import Failed",
            description: updatedJob.error || "Failed to import promotions",
            variant: "destructive",
          });
          setIsImporting(false);
        } else {
          setTimeout(checkJob, 500);
        }
      };
      
      checkJob();
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import promotions",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  const handleCreatePromotion = async (promotionData: Partial<Promotion>) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(promotionData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPromotions(prev => [...prev, data.data]);
        setFilteredPromotions(prev => [...prev, data.data]);
        
        toast({
          title: "Promotion created",
          description: `Promotion "${data.data.code}" has been created successfully.`,
        });
        
        setIsCreateDialogOpen(false);
      } else {
        throw new Error(data.message || 'Failed to create promotion');
      }
    } catch (error) {
      console.error('Create error:', error);
      toast({
        title: "Create failed",
        description: error instanceof Error ? error.message : "Failed to create promotion",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePromotion = async (promotionData: Partial<Promotion>) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/promotions/${editingPromotion?._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(promotionData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPromotions(prev => prev.map(p => p._id === editingPromotion?._id ? data.data : p));
        setFilteredPromotions(prev => prev.map(p => p._id === editingPromotion?._id ? data.data : p));
        
        toast({
          title: "Promotion updated",
          description: `Promotion "${data.data.code}" has been updated successfully.`,
        });
        
        setIsEditDialogOpen(false);
        setEditingPromotion(null);
      } else {
        throw new Error(data.message || 'Failed to update promotion');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update promotion",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromotion = async (promotion: Promotion) => {
    try {
      const response = await fetch(`/api/promotions/${promotion._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPromotions(prev => prev.filter(p => p._id !== promotion._id));
        setFilteredPromotions(prev => prev.filter(p => p._id !== promotion._id));
        
        toast({
          title: "Promotion deleted",
          description: `Promotion "${promotion.code}" has been deleted successfully.`,
        });
        
        setIsDeleteDialogOpen(false);
        setPromotionToDelete(null);
      } else {
        throw new Error(data.message || 'Failed to delete promotion');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete promotion",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.isActive && new Date(p.endDate) >= new Date()).length,
    expired: promotions.filter(p => new Date(p.endDate) < new Date()).length,
    usageRate: promotions.length > 0 
      ? Math.round((promotions.reduce((sum, p) => sum + p.usedCount, 0) / Math.max(promotions.reduce((sum, p) => sum + (p.usageLimit || 0), 0), 1)) * 100) || 0 
      : 0
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" disabled={isImporting} asChild>
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? "Importing..." : "Import"}
              </label>
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".csv,.json"
              onChange={handleImport}
              className="hidden"
            />
            
            <Button variant="outline" size="sm" onClick={loadPromotions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createPromotion}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalPromotions}</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {filteredPromotions.length} showing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activePromotions}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.expiredPromotions}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <p className="text-xs text-muted-foreground">
                {stats.expired === 1 ? 'Expired promotion' : 'Expired promotions'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.usageRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average usage
              </p>
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
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="percentage">{t.percentage}</SelectItem>
                    <SelectItem value="fixed">{t.fixed}</SelectItem>
                    <SelectItem value="free_shipping">{t.freeShipping}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                    <SelectItem value="expired">{t.expired}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPromotions.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noPromotions}</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.createNew}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.code}</TableHead>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.type}</TableHead>
                  <TableHead>{t.value}</TableHead>
                  <TableHead>{t.usage}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.startDate}</TableHead>
                  <TableHead>{t.endDate}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion) => (
                  <TableRow key={promotion._id}>
                    <TableCell className="font-mono">{promotion.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getPromotionName(promotion)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getPromotionDescription(promotion)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(promotion.type)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getValueDisplay(promotion)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{promotion.usedCount}</span>
                        {promotion.usageLimit && (
                          <span className="text-muted-foreground">
                            / {promotion.usageLimit}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(promotion)}</TableCell>
                    <TableCell>
                      {new Date(promotion.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPromotion(promotion)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyCode(promotion.code)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t.copy}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(promotion)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the promotion "{promotionToDelete?.code}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (promotionToDelete) {
                  handleDeletePromotion(promotionToDelete);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Promotion Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Promotion</DialogTitle>
          </DialogHeader>
          <CreatePromotionForm 
            onSubmit={handleCreatePromotion}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
          </DialogHeader>
          <EditPromotionForm 
            promotion={editingPromotion}
            onSubmit={handleUpdatePromotion}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingPromotion(null);
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}

// Create Promotion Form Component
interface CreatePromotionFormProps {
  onSubmit: (data: Partial<Promotion>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function CreatePromotionForm({ onSubmit, onCancel, isSubmitting }: CreatePromotionFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    nameJa: '',
    description: '',
    descriptionEn: '',
    descriptionJa: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Code *</label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="WELCOME10"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Type *</label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Name (Vietnamese) *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Tên khuyến mãi"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name (English)</label>
          <Input
            value={formData.nameEn}
            onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
            placeholder="Promotion name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Name (Japanese)</label>
          <Input
            value={formData.nameJa}
            onChange={(e) => setFormData(prev => ({ ...prev, nameJa: e.target.value }))}
            placeholder="プロモーション名"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description (Vietnamese) *</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả khuyến mãi"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Description (English)</label>
          <Input
            value={formData.descriptionEn}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
            placeholder="Promotion description"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description (Japanese)</label>
          <Input
            value={formData.descriptionJa}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionJa: e.target.value }))}
            placeholder="プロモーション説明"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Value *</label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
            placeholder="10"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Min Order Amount</label>
          <Input
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
            placeholder="500000"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Discount Amount</label>
          <Input
            type="number"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) }))}
            placeholder="100000"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Usage Limit</label>
          <Input
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
            placeholder="1000"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Start Date *</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">End Date *</label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Promotion"}
        </Button>
      </div>
    </form>
  );
}

// Edit Promotion Form Component
interface EditPromotionFormProps {
  promotion: Promotion | null;
  onSubmit: (data: Partial<Promotion>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function EditPromotionForm({ promotion, onSubmit, onCancel, isSubmitting }: EditPromotionFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    nameJa: '',
    description: '',
    descriptionEn: '',
    descriptionJa: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (promotion) {
      setFormData({
        code: promotion.code,
        name: promotion.name,
        nameEn: promotion.nameEn || '',
        nameJa: promotion.nameJa || '',
        description: promotion.description,
        descriptionEn: promotion.descriptionEn || '',
        descriptionJa: promotion.descriptionJa || '',
        type: promotion.type,
        value: promotion.value,
        minOrderAmount: promotion.minOrderAmount || 0,
        maxDiscountAmount: promotion.maxDiscountAmount || 0,
        usageLimit: promotion.usageLimit || 0,
        isActive: promotion.isActive,
        startDate: promotion.startDate.split('T')[0],
        endDate: promotion.endDate.split('T')[0]
      });
    }
  }, [promotion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Code *</label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="WELCOME10"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Type *</label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Name (Vietnamese) *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Tên khuyến mãi"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name (English)</label>
          <Input
            value={formData.nameEn}
            onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
            placeholder="Promotion name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Name (Japanese)</label>
          <Input
            value={formData.nameJa}
            onChange={(e) => setFormData(prev => ({ ...prev, nameJa: e.target.value }))}
            placeholder="プロモーション名"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description (Vietnamese) *</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả khuyến mãi"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Description (English)</label>
          <Input
            value={formData.descriptionEn}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
            placeholder="Promotion description"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description (Japanese)</label>
          <Input
            value={formData.descriptionJa}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionJa: e.target.value }))}
            placeholder="プロモーション説明"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Value *</label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
            placeholder="10"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Min Order Amount</label>
          <Input
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
            placeholder="500000"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Discount Amount</label>
          <Input
            type="number"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) }))}
            placeholder="100000"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Usage Limit</label>
          <Input
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
            placeholder="1000"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Start Date *</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">End Date *</label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive-edit"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <label htmlFor="isActive-edit" className="text-sm font-medium">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Promotion"}
        </Button>
      </div>
    </form>
  );
}
