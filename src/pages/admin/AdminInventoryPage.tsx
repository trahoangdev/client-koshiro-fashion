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
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Warehouse,
  Truck,
  ShoppingCart,
  Download,
  Upload,
  RefreshCw,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { exportImportService } from "@/lib/exportImportService";
import AdminLayout from "@/components/admin/AdminLayout";

interface InventoryItem {
  _id: string;
  productId: string;
  productName: string;
  productNameEn?: string;
  productNameJa?: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  costPrice: number;
  sellingPrice: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  lastSold: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  category: string;
  size?: string;
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  _id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'unreserved';
  quantity: number;
  reason: string;
  reference?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export default function AdminInventoryPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const translations = {
    en: {
      title: "Inventory Management",
      subtitle: "Manage stock levels, track movements, and monitor inventory",
      adjustStock: "Adjust Stock",
      search: "Search inventory...",
      product: "Product",
      sku: "SKU",
      currentStock: "Current Stock",
      availableStock: "Available",
      reservedStock: "Reserved",
      status: "Status",
      location: "Location",
      supplier: "Supplier",
      lastRestocked: "Last Restocked",
      lastSold: "Last Sold",
      actions: "Actions",
      inStock: "In Stock",
      lowStock: "Low Stock",
      outOfStock: "Out of Stock",
      discontinued: "Discontinued",
      adjustQuantity: "Adjust Quantity",
      reason: "Reason",
      save: "Save",
      cancel: "Cancel",
      noInventory: "No inventory items found",
      totalItems: "Total Items",
      lowStockItems: "Low Stock Items",
      outOfStockItems: "Out of Stock Items",
      totalValue: "Total Value",
      stockMovements: "Stock Movements",
      movementType: "Type",
      quantity: "Quantity",
      user: "User",
      date: "Date"
    },
    vi: {
      title: "Quản lý Tồn kho",
      subtitle: "Quản lý mức tồn kho, theo dõi chuyển động và giám sát kho hàng",
      adjustStock: "Điều chỉnh Tồn kho",
      search: "Tìm kiếm tồn kho...",
      product: "Sản phẩm",
      sku: "Mã SKU",
      currentStock: "Tồn kho hiện tại",
      availableStock: "Có sẵn",
      reservedStock: "Đã đặt",
      status: "Trạng thái",
      location: "Vị trí",
      supplier: "Nhà cung cấp",
      lastRestocked: "Nhập kho cuối",
      lastSold: "Bán cuối",
      actions: "Thao tác",
      inStock: "Còn hàng",
      lowStock: "Sắp hết",
      outOfStock: "Hết hàng",
      discontinued: "Ngừng bán",
      adjustQuantity: "Điều chỉnh Số lượng",
      reason: "Lý do",
      save: "Lưu",
      cancel: "Hủy",
      noInventory: "Không tìm thấy sản phẩm tồn kho",
      totalItems: "Tổng sản phẩm",
      lowStockItems: "Sắp hết hàng",
      outOfStockItems: "Hết hàng",
      totalValue: "Tổng giá trị",
      stockMovements: "Chuyển động Tồn kho",
      movementType: "Loại",
      quantity: "Số lượng",
      user: "Người dùng",
      date: "Ngày"
    },
    ja: {
      title: "在庫管理",
      subtitle: "在庫レベル、動きの追跡、在庫の監視",
      adjustStock: "在庫調整",
      search: "在庫検索...",
      product: "商品",
      sku: "SKU",
      currentStock: "現在在庫",
      availableStock: "利用可能",
      reservedStock: "予約済み",
      status: "ステータス",
      location: "場所",
      supplier: "サプライヤー",
      lastRestocked: "最終入庫",
      lastSold: "最終販売",
      actions: "アクション",
      inStock: "在庫あり",
      lowStock: "在庫少",
      outOfStock: "在庫切れ",
      discontinued: "販売終了",
      adjustQuantity: "数量調整",
      reason: "理由",
      save: "保存",
      cancel: "キャンセル",
      noInventory: "在庫商品が見つかりません",
      totalItems: "総商品数",
      lowStockItems: "在庫少商品",
      outOfStockItems: "在庫切れ商品",
      totalValue: "総価値",
      stockMovements: "在庫動き",
      movementType: "タイプ",
      quantity: "数量",
      user: "ユーザー",
      date: "日付"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Load inventory data
  useEffect(() => {
    loadInventory();
    loadStockMovements();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      if (data.success) {
        setInventory(data.data);
        setFilteredInventory(data.data);
      } else {
        throw new Error(data.message || 'Failed to load inventory');
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      
      // Set empty arrays if API fails
      setInventory([]);
      setFilteredInventory([]);
      
      toast({
        title: "Error",
        description: "Failed to load inventory. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStockMovements = async () => {
    try {
      const response = await fetch('/api/inventory/movements?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setStockMovements(data.data);
      }
    } catch (error) {
      console.error('Error loading stock movements:', error);
    }
  };

  // Filter inventory
  useEffect(() => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.productNameEn && item.productNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.productNameJa && item.productNameJa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, filterStatus, filterCategory]);

  const getProductName = (item: InventoryItem) => {
    switch (language) {
      case 'vi': return item.productName;
      case 'ja': return item.productNameJa || item.productName;
      default: return item.productNameEn || item.productName;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t.inStock}</Badge>;
      case 'low_stock':
        return <Badge variant="destructive" className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />{t.lowStock}</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t.outOfStock}</Badge>;
      case 'discontinued':
        return <Badge variant="secondary">{t.discontinued}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'adjustment':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'reserved':
        return <ShoppingCart className="h-4 w-4 text-yellow-500" />;
      case 'unreserved':
        return <ShoppingCart className="h-4 w-4 text-gray-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'In';
      case 'out': return 'Out';
      case 'adjustment': return 'Adjustment';
      case 'reserved': return 'Reserved';
      case 'unreserved': return 'Unreserved';
      default: return type;
    }
  };

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustmentQuantity(0);
    setAdjustmentReason("");
    setIsAdjustStockDialogOpen(true);
  };

  const handleSaveAdjustment = async () => {
    if (!selectedItem || !adjustmentReason) return;

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/inventory/${selectedItem._id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quantity: adjustmentQuantity,
          reason: adjustmentReason
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update inventory in state
        setInventory(prev => prev.map(item => 
          item._id === selectedItem._id ? data.data : item
        ));

        // Add new movement to the beginning of the list
        if (data.movement) {
          setStockMovements(prev => [data.movement, ...prev.slice(0, 9)]);
        }

        toast({
          title: "Stock adjusted",
          description: `Stock for ${getProductName(selectedItem)} has been adjusted by ${adjustmentQuantity > 0 ? '+' : ''}${adjustmentQuantity}`,
        });

        setIsAdjustStockDialogOpen(false);
        setSelectedItem(null);
        setAdjustmentQuantity(0);
        setAdjustmentReason("");
      } else {
        throw new Error(data.message || 'Failed to adjust stock');
      }
    } catch (error) {
      console.error('Adjust stock error:', error);
      toast({
        title: "Adjustment failed",
        description: error instanceof Error ? error.message : "Failed to adjust stock",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (format: 'excel' | 'csv' | 'json') => {
    try {
      setIsExporting(true);
      
      // Flatten inventory data for export
      const exportData = filteredInventory.map(item => ({
        'SKU': item.sku,
        'Product Name (VI)': item.productName,
        'Product Name (EN)': item.productNameEn || '',
        'Product Name (JA)': item.productNameJa || '',
        'Category': item.category,
        'Size': item.size || '',
        'Color': item.color || '',
        'Current Stock': item.currentStock,
        'Min Stock': item.minStock,
        'Max Stock': item.maxStock,
        'Reserved Stock': item.reservedStock,
        'Available Stock': item.availableStock,
        'Cost Price': item.costPrice,
        'Selling Price': item.sellingPrice,
        'Location': item.location,
        'Supplier': item.supplier,
        'Status': item.status,
        'Last Restocked': item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : '',
        'Last Sold': item.lastSold ? new Date(item.lastSold).toLocaleDateString() : '',
        'Notes': item.notes || '',
        'Created At': new Date(item.createdAt).toLocaleDateString(),
        'Updated At': new Date(item.updatedAt).toLocaleDateString()
      }));

      const job = await exportImportService.startExportJob(
        'inventory',
        format,
        exportData
      );

      toast({
        title: "Export started",
        description: `Inventory will be exported as ${format.toUpperCase()}`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getExportJob(job.id);
        if (updatedJob?.status === 'completed' && updatedJob.downloadUrl) {
          const link = document.createElement('a');
          link.href = updatedJob.downloadUrl;
          const fileExtension = format === 'excel' ? 'xls' : format;
          link.download = `inventory_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(updatedJob.downloadUrl);
          
          toast({
            title: "Export Completed",
            description: `Inventory exported successfully to ${format.toUpperCase()}`,
          });
          setIsExporting(false);
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: "Export Failed",
            description: updatedJob.error || "Failed to export inventory",
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
        description: "Failed to export inventory",
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
      const job = await exportImportService.startImportJob('inventory', file);
      
      toast({
        title: "Import Started",
        description: `Importing inventory from ${file.name}`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getImportJob(job.id);
        if (updatedJob?.status === 'completed') {
          const successMessage = updatedJob.error ? 
            `Import completed with warnings: ${updatedJob.error}` :
            `Successfully imported ${updatedJob.processedRows} inventory items`;
            
          toast({
            title: "Import Completed",
            description: successMessage,
            variant: updatedJob.error ? "default" : "default",
          });
          setIsImporting(false);
          // Reload data to show new inventory items
          window.location.reload();
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: "Import Failed",
            description: updatedJob.error || "Failed to import inventory",
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
        description: "Failed to import inventory",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  const stats = {
    total: inventory.length,
    lowStock: inventory.filter(item => item.status === 'low_stock').length,
    outOfStock: inventory.filter(item => item.status === 'out_of_stock').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0)
  };

  const categories = [...new Set(inventory.map(item => item.category))];

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
            
            <Button variant="outline" size="sm" onClick={loadInventory}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalItems}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {filteredInventory.length} showing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.lowStockItems}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.outOfStockItems}</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              <p className="text-xs text-muted-foreground">
                Out of stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalValue}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue, language)}</div>
              <p className="text-xs text-muted-foreground">
                Total inventory value
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_stock">{t.inStock}</SelectItem>
                    <SelectItem value="low_stock">{t.lowStock}</SelectItem>
                    <SelectItem value="out_of_stock">{t.outOfStock}</SelectItem>
                    <SelectItem value="discontinued">{t.discontinued}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noInventory}</p>
              <Button 
                onClick={loadInventory}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.product}</TableHead>
                  <TableHead>{t.sku}</TableHead>
                  <TableHead>{t.currentStock}</TableHead>
                  <TableHead>{t.availableStock}</TableHead>
                  <TableHead>{t.reservedStock}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.location}</TableHead>
                  <TableHead>{t.supplier}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getProductName(item)}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.category} • {item.size} • {item.color}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{item.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.currentStock}</span>
                        <span className="text-muted-foreground">/ {item.maxStock}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {item.availableStock}
                    </TableCell>
                    <TableCell className="text-yellow-600">
                      {item.reservedStock}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="font-mono">{item.location}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAdjustStock(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.adjustStock}
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

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>{t.stockMovements}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.movementType}</TableHead>
                <TableHead>{t.product}</TableHead>
                <TableHead>{t.quantity}</TableHead>
                <TableHead>{t.reason}</TableHead>
                <TableHead>{t.user}</TableHead>
                <TableHead>{t.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.slice(0, 10).map((movement) => (
                <TableRow key={movement._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementTypeIcon(movement.type)}
                      <span>{getMovementTypeLabel(movement.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(movement.productId as any)?.name || 'Unknown Product'}
                  </TableCell>
                  <TableCell className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell>{movement.userName}</TableCell>
                  <TableCell>
                    {new Date(movement.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustStockDialogOpen} onOpenChange={setIsAdjustStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.adjustStock}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium">{getProductName(selectedItem)}</h3>
                <p className="text-sm text-muted-foreground">
                  Current Stock: {selectedItem.currentStock} | SKU: {selectedItem.sku}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.adjustQuantity}</label>
              <Input
                type="number"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                placeholder="Enter quantity adjustment (+/-)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.reason}</label>
              <Input
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Enter reason for adjustment"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdjustStockDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button 
                onClick={handleSaveAdjustment} 
                disabled={isSubmitting || !adjustmentReason}
              >
                {isSubmitting ? "Saving..." : t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
