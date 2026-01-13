import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts";
import { api } from "@/lib/api";
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
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  User,
  Phone,
  Mail,
  Calendar,
  Navigation,
  Timer,
  DollarSign,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { exportImportService } from "@/lib/exportImportService";
import AdminLayout from "@/components/admin/AdminLayout";

interface ShippingMethod {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  type: 'standard' | 'express' | 'overnight' | 'pickup';
  cost: number;
  freeShippingThreshold?: number;
  estimatedDays: number;
  isActive: boolean;
  supportedRegions: string[];
  weightLimit?: number;
  dimensionsLimit?: string;
  createdAt: string;
  updatedAt: string;
}

interface Shipment {
  _id: string;
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  shippingMethod: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
  carrier: string;
  carrierTrackingUrl?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  notes?: string;
  weight?: number;
  dimensions?: string;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
}

interface TrackingEvent {
  _id: string;
  shipmentId: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
  carrier?: string;
}

export default function AdminShippingPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [isCreateMethodDialogOpen, setIsCreateMethodDialogOpen] = useState(false);
  const [isEditMethodDialogOpen, setIsEditMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    location: '',
    description: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    inTransit: 0,
    failed: 0,
    totalCost: 0
  });

  const translations = {
    en: {
      title: "Shipping & Logistics Management",
      subtitle: "Manage shipping methods, track shipments, and monitor delivery status",
      createMethod: "Create Shipping Method",
      search: "Search shipments...",
      orderNumber: "Order #",
      trackingNumber: "Tracking #",
      customer: "Customer",
      method: "Method",
      status: "Status",
      carrier: "Carrier",
      estimatedDelivery: "Est. Delivery",
      actualDelivery: "Actual Delivery",
      cost: "Cost",
      actions: "Actions",
      pending: "Pending",
      pickedUp: "Picked Up",
      inTransit: "In Transit",
      outForDelivery: "Out for Delivery",
      delivered: "Delivered",
      failed: "Failed",
      returned: "Returned",
      standard: "Standard",
      express: "Express",
      overnight: "Overnight",
      pickup: "Pickup",
      noShipments: "No shipments found",
      totalShipments: "Total Shipments",
      pendingShipments: "Pending Shipments",
      deliveredShipments: "Delivered Shipments",
      totalCost: "Total Shipping Cost",
      trackingDetails: "Tracking Details",
      trackingHistory: "Tracking History",
      updateStatus: "Update Status",
      addTrackingEvent: "Add Tracking Event",
      location: "Location",
      description: "Description",
      timestamp: "Timestamp",
      save: "Save",
      cancel: "Cancel"
    },
    vi: {
      title: "Quản lý Vận chuyển & Giao hàng",
      subtitle: "Quản lý phương thức vận chuyển, theo dõi đơn hàng và giám sát trạng thái giao hàng",
      createMethod: "Tạo Phương thức Vận chuyển",
      search: "Tìm kiếm đơn hàng...",
      orderNumber: "Mã đơn hàng",
      trackingNumber: "Mã theo dõi",
      customer: "Khách hàng",
      method: "Phương thức",
      status: "Trạng thái",
      carrier: "Nhà vận chuyển",
      estimatedDelivery: "Dự kiến giao",
      actualDelivery: "Giao thực tế",
      cost: "Chi phí",
      actions: "Thao tác",
      pending: "Chờ xử lý",
      pickedUp: "Đã lấy hàng",
      inTransit: "Đang vận chuyển",
      outForDelivery: "Đang giao",
      delivered: "Đã giao",
      failed: "Giao thất bại",
      returned: "Trả về",
      standard: "Tiêu chuẩn",
      express: "Nhanh",
      overnight: "Qua đêm",
      pickup: "Tự lấy",
      noShipments: "Không tìm thấy đơn hàng",
      totalShipments: "Tổng đơn hàng",
      pendingShipments: "Đơn chờ xử lý",
      deliveredShipments: "Đơn đã giao",
      totalCost: "Tổng chi phí vận chuyển",
      trackingDetails: "Chi tiết theo dõi",
      trackingHistory: "Lịch sử theo dõi",
      updateStatus: "Cập nhật trạng thái",
      addTrackingEvent: "Thêm sự kiện theo dõi",
      location: "Vị trí",
      description: "Mô tả",
      timestamp: "Thời gian",
      save: "Lưu",
      cancel: "Hủy"
    },
    ja: {
      title: "配送・物流管理",
      subtitle: "配送方法の管理、配送の追跡、配送状況の監視",
      createMethod: "配送方法作成",
      search: "配送検索...",
      orderNumber: "注文番号",
      trackingNumber: "追跡番号",
      customer: "顧客",
      method: "方法",
      status: "ステータス",
      carrier: "運送業者",
      estimatedDelivery: "予定配送",
      actualDelivery: "実際配送",
      cost: "コスト",
      actions: "アクション",
      pending: "保留中",
      pickedUp: "集荷済み",
      inTransit: "輸送中",
      outForDelivery: "配送中",
      delivered: "配送完了",
      failed: "配送失敗",
      returned: "返却",
      standard: "標準",
      express: "速達",
      overnight: "翌日",
      pickup: "店頭受取",
      noShipments: "配送が見つかりません",
      totalShipments: "総配送数",
      pendingShipments: "保留配送",
      deliveredShipments: "配送完了",
      totalCost: "総配送コスト",
      trackingDetails: "追跡詳細",
      trackingHistory: "追跡履歴",
      updateStatus: "ステータス更新",
      addTrackingEvent: "追跡イベント追加",
      location: "場所",
      description: "説明",
      timestamp: "タイムスタンプ",
      save: "保存",
      cancel: "キャンセル"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Load data from API
  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) {
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load shipping methods, shipments, and stats in parallel
        const [methodsResponse, shipmentsResponse, statsResponse] = await Promise.all([
          api.getShippingMethods(),
          api.getShipments({ page: 1, limit: 100 }),
          api.getShippingStats()
        ]);

        setShippingMethods(methodsResponse);
        setShipments(shipmentsResponse.shipments);
        setFilteredShipments(shipmentsResponse.shipments);
        setStats(statsResponse);
      } catch (error) {
        console.error('Error loading shipping data:', error);
        toast({
          title: "Error",
          description: "Failed to load shipping data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user?.role, toast]);

  // Filter shipments
  useEffect(() => {
    let filtered = shipments;

    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        shipment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(shipment => shipment.status === filterStatus);
    }

    if (filterMethod !== "all") {
      filtered = filtered.filter(shipment => shipment.shippingMethod === filterMethod);
    }

    setFilteredShipments(filtered);
  }, [shipments, searchTerm, filterStatus, filterMethod]);

  const getMethodName = (method: ShippingMethod | undefined) => {
    if (!method) return 'Unknown Method';
    switch (language) {
      case 'vi': return method.name || 'Unknown';
      case 'ja': return method.nameJa || method.name || 'Unknown';
      default: return method.nameEn || method.name || 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t.pending}</Badge>;
      case 'picked_up':
        return <Badge variant="outline"><Package className="h-3 w-3 mr-1" />{t.pickedUp}</Badge>;
      case 'in_transit':
        return <Badge variant="default"><Truck className="h-3 w-3 mr-1" />{t.inTransit}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-blue-500"><Navigation className="h-3 w-3 mr-1" />{t.outForDelivery}</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t.delivered}</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t.failed}</Badge>;
      case 'returned':
        return <Badge variant="destructive" className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />{t.returned}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'standard': return t.standard;
      case 'express': return t.express;
      case 'overnight': return t.overnight;
      case 'pickup': return t.pickup;
      default: return type;
    }
  };

  const handleViewTracking = async (shipment: Shipment) => {
    try {
      setSelectedShipment(shipment);
      const events = await api.getTrackingEvents(shipment._id);
      setTrackingEvents(events);
      setIsTrackingDialogOpen(true);
    } catch (error) {
      console.error('Error loading tracking events:', error);
      toast({
        title: "Error",
        description: "Failed to load tracking events",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setStatusUpdateData({
      status: shipment.status,
      location: '',
      description: '',
      notes: ''
    });
    setIsUpdateStatusDialogOpen(true);
  };

  const handleStatusUpdateSubmit = async () => {
    if (!selectedShipment) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.updateShipmentStatus(selectedShipment._id, statusUpdateData);
      
      // Update local state
      setShipments(prev => 
        prev.map(shipment => 
          shipment._id === selectedShipment._id 
            ? { ...shipment, ...response.shipment }
            : shipment
        )
      );
      
      setIsUpdateStatusDialogOpen(false);
      setSelectedShipment(null);
      toast({
        title: "Status Updated",
        description: `Shipment status updated successfully`,
      });
    } catch (error) {
      console.error('Error updating shipment status:', error);
      toast({
        title: "Error",
        description: "Failed to update shipment status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  interface CreateMethodData {
    name: string;
    nameEn?: string;
    nameJa?: string;
    description: string;
    type: 'standard' | 'express' | 'overnight' | 'pickup';
    cost: number;
    estimatedDays: number;
    isActive: boolean;
    supportedRegions: string[];
  }

  const handleCreateMethod = async (methodData: CreateMethodData) => {
    try {
      setIsSubmitting(true);
      const response = await api.createShippingMethod(methodData);
      
      // Ensure the method object has all required properties
      const newMethod: ShippingMethod = {
        _id: response.method?._id || Date.now().toString(),
        name: response.method?.name || methodData.name || 'Unknown',
        nameEn: response.method?.nameEn || methodData.nameEn || '',
        nameJa: response.method?.nameJa || methodData.nameJa || '',
        description: (response.method as Record<string, unknown>)?.description as string || methodData.description || '',
        descriptionEn: (response.method as Record<string, unknown>)?.descriptionEn as string || '',
        descriptionJa: (response.method as Record<string, unknown>)?.descriptionJa as string || '',
        type: (response.method?.type || methodData.type || 'standard') as 'standard' | 'express' | 'overnight' | 'pickup',
        cost: response.method?.cost || methodData.cost || 0,
        freeShippingThreshold: response.method?.freeShippingThreshold,
        estimatedDays: response.method?.estimatedDays || methodData.estimatedDays || 3,
        isActive: response.method?.isActive !== undefined ? response.method.isActive : (methodData.isActive !== undefined ? methodData.isActive : true),
        supportedRegions: response.method?.supportedRegions || [],
        weightLimit: response.method?.weightLimit,
        dimensionsLimit: response.method?.dimensionsLimit,
        createdAt: response.method?.createdAt || new Date().toISOString(),
        updatedAt: response.method?.updatedAt || new Date().toISOString()
      };
      
      setShippingMethods(prev => [newMethod, ...prev]);
      setIsCreateMethodDialogOpen(false);
      toast({
        title: "Success",
        description: "Shipping method created successfully",
      });
    } catch (error) {
      console.error('Error creating shipping method:', error);
      toast({
        title: "Error",
        description: "Failed to create shipping method",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMethod = async (id: string, methodData: CreateMethodData) => {
    try {
      setIsSubmitting(true);
      const response = await api.updateShippingMethod(id, methodData);
      setShippingMethods(prev => 
        prev.map(method => method._id === id ? { ...method, ...response.method } : method)
      );
      setIsEditMethodDialogOpen(false);
      setEditingMethod(null);
      toast({
        title: "Success",
        description: "Shipping method updated successfully",
      });
    } catch (error) {
      console.error('Error updating shipping method:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping method",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await api.deleteShippingMethod(id);
      setShippingMethods(prev => prev.filter(method => method._id !== id));
      toast({
        title: "Success",
        description: "Shipping method deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      toast({
        title: "Error",
        description: "Failed to delete shipping method",
        variant: "destructive",
      });
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
      setIsSubmitting(true);
      const job = await exportImportService.startImportJob('shipping', file);
      
      toast({
        title: "Import Started",
        description: `Importing shipping methods from ${file.name}`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getImportJob(job.id);
        if (updatedJob?.status === 'completed') {
          const successMessage = updatedJob.error ? 
            `Import completed with warnings: ${updatedJob.error}` :
            `Successfully imported ${updatedJob.processedRows} shipping methods`;
            
          toast({
            title: "Import Completed",
            description: successMessage,
            variant: updatedJob.error ? "default" : "default",
          });
          setIsSubmitting(false);
          // Reload data to show new shipping methods
          window.location.reload();
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: "Import Failed",
            description: updatedJob.error || "Failed to import shipping methods",
            variant: "destructive",
          });
          setIsSubmitting(false);
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
        description: "Failed to import shipping methods",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleExportData = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const exportData = filteredShipments.map(shipment => ({
        orderNumber: shipment.orderNumber,
        trackingNumber: shipment.trackingNumber,
        customerName: shipment.customerName,
        customerPhone: shipment.customerPhone,
        shippingMethod: shipment.shippingMethod,
        status: shipment.status,
        carrier: shipment.carrier,
        estimatedDelivery: shipment.estimatedDelivery,
        actualDelivery: shipment.actualDelivery || '',
        shippingCost: shipment.shippingCost,
        weight: shipment.weight || '',
        dimensions: shipment.dimensions || '',
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt
      }));

      const fileName = `shipments_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'excel') {
        const blob = await exportImportService.exportToExcel(exportData);
        const url = URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', `${fileName}.xlsx`);
        linkElement.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvContent = await exportImportService.exportToCSV(exportData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', `${fileName}.csv`);
        linkElement.click();
        URL.revokeObjectURL(url);
      } else {
        // JSON export
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `${fileName}.json`);
        linkElement.click();
      }
      
      toast({
        title: "Export Successful",
        description: `Shipments exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export shipments data",
        variant: "destructive",
      });
    }
  };

  // Use stats from API instead of calculating from shipments

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin'))) {
      window.location.href = '/admin/login';
    }
  }, [authLoading, isAuthenticated, user?.role]);

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportData('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('excel')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleImport}
              style={{ display: 'none' }}
              id="shipping-import"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('shipping-import')?.click()}
              disabled={isSubmitting}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsCreateMethodDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createMethod}
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalShipments}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.pendingShipments}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.deliveredShipments}</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalCost}</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalCost, language)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Methods Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Estimated Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingMethods?.length > 0 ? (
                shippingMethods.map((method) => (
                  <TableRow key={method._id}>
                    <TableCell className="font-medium">
                      {getMethodName(method)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {method.type || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(method.cost || 0, language)}
                    </TableCell>
                    <TableCell>{method.estimatedDays || 0} days</TableCell>
                    <TableCell>
                      <Badge variant={method.isActive ? "default" : "secondary"}>
                        {method.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingMethod(method);
                            setIsEditMethodDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMethod(method._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No shipping methods found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="picked_up">{t.pickedUp}</SelectItem>
                <SelectItem value="in_transit">{t.inTransit}</SelectItem>
                <SelectItem value="out_for_delivery">{t.outForDelivery}</SelectItem>
                <SelectItem value="delivered">{t.delivered}</SelectItem>
                <SelectItem value="failed">{t.failed}</SelectItem>
                <SelectItem value="returned">{t.returned}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {shippingMethods.map(method => (
                  <SelectItem key={method._id} value={method.name}>
                    {getMethodName(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredShipments.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noShipments}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.orderNumber}</TableHead>
                  <TableHead>{t.trackingNumber}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.method}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.carrier}</TableHead>
                  <TableHead>{t.estimatedDelivery}</TableHead>
                  <TableHead>{t.cost}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment._id}>
                    <TableCell className="font-mono">{shipment.orderNumber}</TableCell>
                    <TableCell className="font-mono">{shipment.trackingNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{shipment.customerName}</div>
                        <div className="text-sm text-muted-foreground">{shipment.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{shipment.shippingMethod}</TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell>{shipment.carrier}</TableCell>
                    <TableCell>
                      {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(shipment.shippingCost, language)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTracking(shipment)}>
                            <MapPin className="h-4 w-4 mr-2" />
                            {t.trackingDetails}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(shipment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.updateStatus}
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

      {/* Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t.trackingDetails}</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-6">
              {/* Shipment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Order Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Order: {selectedShipment.orderNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tracking: {selectedShipment.trackingNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Method: {selectedShipment.shippingMethod}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Customer Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedShipment.customerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedShipment.customerPhone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedShipment.shippingAddress.address}, {selectedShipment.shippingAddress.district}, {selectedShipment.shippingAddress.city}
                  </p>
                </div>
              </div>

              {/* Tracking History */}
              <div>
                <h3 className="font-medium mb-4">{t.trackingHistory}</h3>
                <div className="space-y-4">
                  {trackingEvents
                    .filter(event => event.shipmentId === selectedShipment._id)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((event) => (
                      <div key={event._id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{event.status}</span>
                            <Badge variant="outline">{event.location}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {event.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Shipment Status</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium">Shipment Details</h3>
                <p className="text-sm text-muted-foreground">
                  Order: {selectedShipment.orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tracking: {selectedShipment.trackingNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Current Status: {selectedShipment.status}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select 
                    value={statusUpdateData.status} 
                    onValueChange={(value) => setStatusUpdateData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="Enter current location"
                    value={statusUpdateData.location}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Enter status description"
                    value={statusUpdateData.description}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    placeholder="Enter additional notes"
                    value={statusUpdateData.notes}
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUpdateStatusDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusUpdateSubmit}
                  disabled={isSubmitting || !statusUpdateData.status}
                >
                  {isSubmitting ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Shipping Method Dialog */}
      <Dialog open={isCreateMethodDialogOpen} onOpenChange={setIsCreateMethodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shipping Method</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const methodData: CreateMethodData = {
              name: formData.get('name') as string,
              nameEn: formData.get('nameEn') as string,
              nameJa: formData.get('nameJa') as string,
              description: formData.get('description') as string,
              type: formData.get('type') as 'standard' | 'express' | 'overnight' | 'pickup',
              cost: parseFloat(formData.get('cost') as string),
              estimatedDays: parseInt(formData.get('estimatedDays') as string),
              isActive: formData.get('isActive') === 'on',
              supportedRegions: []
            };
            handleCreateMethod(methodData);
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name (VI)</label>
                <Input name="name" placeholder="Enter shipping method name" required />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Name (EN)</label>
                <Input name="nameEn" placeholder="Enter English name" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Name (JA)</label>
                <Input name="nameJa" placeholder="Enter Japanese name" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input name="description" placeholder="Enter description" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="overnight">Overnight</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost</label>
                <Input name="cost" type="number" step="0.01" placeholder="Enter cost" required />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Days</label>
                <Input name="estimatedDays" type="number" placeholder="Enter estimated days" required />
              </div>
              
              <div className="flex items-center space-x-2">
                <input name="isActive" type="checkbox" defaultChecked />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateMethodDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Method"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Shipping Method Dialog */}
      <Dialog open={isEditMethodDialogOpen} onOpenChange={setIsEditMethodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shipping Method</DialogTitle>
          </DialogHeader>
          {editingMethod && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const methodData: CreateMethodData = {
                name: formData.get('name') as string,
                nameEn: formData.get('nameEn') as string,
                nameJa: formData.get('nameJa') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as 'standard' | 'express' | 'overnight' | 'pickup',
                cost: parseFloat(formData.get('cost') as string),
                estimatedDays: parseInt(formData.get('estimatedDays') as string),
                isActive: formData.get('isActive') === 'on',
                supportedRegions: []
              };
              handleUpdateMethod(editingMethod._id, methodData);
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (VI)</label>
                  <Input name="name" defaultValue={editingMethod.name} required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (EN)</label>
                  <Input name="nameEn" defaultValue={editingMethod.nameEn || ''} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (JA)</label>
                  <Input name="nameJa" defaultValue={editingMethod.nameJa || ''} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input name="description" defaultValue={editingMethod.description} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select name="type" defaultValue={editingMethod.type} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost</label>
                  <Input name="cost" type="number" step="0.01" defaultValue={editingMethod.cost} required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Days</label>
                  <Input name="estimatedDays" type="number" defaultValue={editingMethod.estimatedDays} required />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input name="isActive" type="checkbox" defaultChecked={editingMethod.isActive} />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditMethodDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Method"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
