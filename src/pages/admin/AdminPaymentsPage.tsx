import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth, isAdminUser } from "@/contexts";
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
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Calendar,
  User,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Upload,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { exportImportService } from "@/lib/exportImportService";
import AdminLayout from "@/components/admin/AdminLayout";

interface AdminPaymentMethod {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
  provider: string;
  isActive: boolean;
  processingFee: number;
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies: string[];
  icon?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  orderId: string;
  orderNumber: string;
  transactionId: string;
  paymentMethod: string;
  paymentProvider: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  gatewayResponse?: Record<string, unknown>;
  gatewayTransactionId?: string;
  refundAmount?: number;
  refundReason?: string;
  processedAt?: string;
  failedAt?: string;
  refundedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Refund {
  _id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedBy: string;
  approvedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [paymentMethods, setPaymentMethods] = useState<AdminPaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");
  const [isCreateMethodDialogOpen, setIsCreateMethodDialogOpen] = useState(false);
  const [isEditMethodDialogOpen, setIsEditMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<AdminPaymentMethod | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isUpdateTransactionDialogOpen, setIsUpdateTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionUpdateData, setTransactionUpdateData] = useState({
    status: '',
    notes: ''
  });
  const [refundData, setRefundData] = useState({
    amount: 0,
    reason: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    refunded: 0,
    totalAmount: 0,
    refundStats: []
  });

  const translations = {
    en: {
      title: "Payment & Transaction Management",
      subtitle: "Manage payment methods, track transactions, and handle refunds",
      createMethod: "Create Payment Method",
      search: "Search transactions...",
      orderNumber: "Order #",
      transactionId: "Transaction ID",
      customer: "Customer",
      method: "Method",
      amount: "Amount",
      status: "Status",
      processedAt: "Processed At",
      actions: "Actions",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      partiallyRefunded: "Partially Refunded",
      creditCard: "Credit Card",
      debitCard: "Debit Card",
      bankTransfer: "Bank Transfer",
      eWallet: "E-Wallet",
      cod: "Cash on Delivery",
      crypto: "Cryptocurrency",
      noTransactions: "No transactions found",
      totalTransactions: "Total Transactions",
      completedTransactions: "Completed",
      failedTransactions: "Failed",
      totalAmount: "Total Amount",
      refunds: "Refunds",
      processRefund: "Process Refund",
      refundAmount: "Refund Amount",
      refundReason: "Refund Reason",
      save: "Save",
      cancel: "Cancel",
      approve: "Approve",
      reject: "Reject",
      viewDetails: "View Details",
      exportTransactions: "Export Transactions"
    },
    vi: {
      title: "Quản lý Thanh toán & Giao dịch",
      subtitle: "Quản lý phương thức thanh toán, theo dõi giao dịch và xử lý hoàn tiền",
      createMethod: "Tạo Phương thức Thanh toán",
      search: "Tìm kiếm giao dịch...",
      orderNumber: "Mã đơn hàng",
      transactionId: "Mã giao dịch",
      customer: "Khách hàng",
      method: "Phương thức",
      amount: "Số tiền",
      status: "Trạng thái",
      processedAt: "Xử lý lúc",
      actions: "Thao tác",
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
      failed: "Thất bại",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
      partiallyRefunded: "Hoàn tiền một phần",
      creditCard: "Thẻ tín dụng",
      debitCard: "Thẻ ghi nợ",
      bankTransfer: "Chuyển khoản",
      eWallet: "Ví điện tử",
      cod: "Thanh toán khi nhận hàng",
      crypto: "Tiền điện tử",
      noTransactions: "Không tìm thấy giao dịch",
      totalTransactions: "Tổng giao dịch",
      completedTransactions: "Hoàn thành",
      failedTransactions: "Thất bại",
      totalAmount: "Tổng số tiền",
      refunds: "Hoàn tiền",
      processRefund: "Xử lý hoàn tiền",
      refundAmount: "Số tiền hoàn",
      refundReason: "Lý do hoàn tiền",
      save: "Lưu",
      cancel: "Hủy",
      approve: "Phê duyệt",
      reject: "Từ chối",
      viewDetails: "Xem chi tiết",
      exportTransactions: "Xuất giao dịch"
    },
    ja: {
      title: "支払い・取引管理",
      subtitle: "支払い方法の管理、取引の追跡、返金の処理",
      createMethod: "支払い方法作成",
      search: "取引検索...",
      orderNumber: "注文番号",
      transactionId: "取引ID",
      customer: "顧客",
      method: "方法",
      amount: "金額",
      status: "ステータス",
      processedAt: "処理日時",
      actions: "アクション",
      pending: "保留中",
      processing: "処理中",
      completed: "完了",
      failed: "失敗",
      cancelled: "キャンセル",
      refunded: "返金済み",
      partiallyRefunded: "一部返金",
      creditCard: "クレジットカード",
      debitCard: "デビットカード",
      bankTransfer: "銀行振込",
      eWallet: "電子ウォレット",
      cod: "代金引換",
      crypto: "暗号通貨",
      noTransactions: "取引が見つかりません",
      totalTransactions: "総取引数",
      completedTransactions: "完了",
      failedTransactions: "失敗",
      totalAmount: "総金額",
      refunds: "返金",
      processRefund: "返金処理",
      refundAmount: "返金額",
      refundReason: "返金理由",
      save: "保存",
      cancel: "キャンセル",
      approve: "承認",
      reject: "拒否",
      viewDetails: "詳細表示",
      exportTransactions: "取引エクスポート"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Load data from API
  useEffect(() => {
    if (!isAuthenticated || !isAdminUser(user)) {
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load payment methods, transactions, refunds, and stats in parallel
        const [methodsResponse, transactionsResponse, refundsResponse, statsResponse] = await Promise.all([
          api.getAdminPaymentMethods(),
          api.getTransactions({ page: 1, limit: 100 }),
          api.getRefunds({ page: 1, limit: 100 }),
          api.getPaymentStats()
        ]);

        setPaymentMethods(methodsResponse);
        setTransactions(transactionsResponse.transactions);
        setFilteredTransactions(transactionsResponse.transactions);
        setRefunds(refundsResponse.refunds);
        setStats(statsResponse);
      } catch (error) {
        console.error('Error loading payment data:', error);
        toast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user, toast]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(transaction => transaction.status === filterStatus);
    }

    if (filterMethod !== "all") {
      filtered = filtered.filter(transaction => transaction.paymentMethod === filterMethod);
    }

    // Date range filter
    if (filterDateRange !== "all") {
      const now = new Date();
      const days = filterDateRange === "today" ? 0 : 
                   filterDateRange === "week" ? 7 : 
                   filterDateRange === "month" ? 30 : 365;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(transaction => 
        new Date(transaction.createdAt) >= cutoffDate
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterStatus, filterMethod, filterDateRange]);

  const getMethodName = (method: AdminPaymentMethod | undefined) => {
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
      case 'processing':
        return <Badge variant="default"><RefreshCw className="h-3 w-3 mr-1" />{t.processing}</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t.completed}</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t.failed}</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />{t.cancelled}</Badge>;
      case 'refunded':
        return <Badge variant="destructive" className="bg-orange-500"><TrendingDown className="h-3 w-3 mr-1" />{t.refunded}</Badge>;
      case 'partially_refunded':
        return <Badge variant="destructive" className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />{t.partiallyRefunded}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card': return t.creditCard;
      case 'debit_card': return t.debitCard;
      case 'bank_transfer': return t.bankTransfer;
      case 'e_wallet': return t.eWallet;
      case 'cod': return t.cod;
      case 'crypto': return t.crypto;
      default: return type;
    }
  };

  const handleProcessRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsRefundDialogOpen(true);
  };

  const handleViewDetails = async (transaction: Transaction) => {
    try {
      const response = await api.getTransaction(transaction._id);
      toast({
        title: "Transaction Details",
        description: `Viewing details for ${transaction.transactionId}`,
      });
    } catch (error) {
      console.error('Error loading transaction details:', error);
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTransactionStatus = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionUpdateData({
      status: transaction.status,
      notes: transaction.notes || ''
    });
    setIsUpdateTransactionDialogOpen(true);
  };

  const handleTransactionStatusUpdateSubmit = async () => {
    if (!selectedTransaction) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.updateTransactionStatus(selectedTransaction._id, transactionUpdateData);
      
      // Update local state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction._id === selectedTransaction._id 
            ? { ...transaction, ...response.transaction }
            : transaction
        )
      );
      
      setIsUpdateTransactionDialogOpen(false);
      setSelectedTransaction(null);
      toast({
        title: "Status Updated",
        description: `Transaction status updated successfully`,
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
      const job = await exportImportService.startImportJob('payments', file);
      
      toast({
        title: "Import Started",
        description: `Importing payment methods from ${file.name}`,
      });

      // Wait for job completion
      const checkJob = async () => {
        const updatedJob = exportImportService.getImportJob(job.id);
        if (updatedJob?.status === 'completed') {
          const successMessage = updatedJob.error ? 
            `Import completed with warnings: ${updatedJob.error}` :
            `Successfully imported ${updatedJob.processedRows} payment methods`;
            
          toast({
            title: "Import Completed",
            description: successMessage,
            variant: updatedJob.error ? "default" : "default",
          });
          setIsSubmitting(false);
          // Reload data to show new payment methods
          window.location.reload();
        } else if (updatedJob?.status === 'failed') {
          toast({
            title: "Import Failed",
            description: updatedJob.error || "Failed to import payment methods",
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
        description: "Failed to import payment methods",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleExportTransactions = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const exportData = filteredTransactions.map(transaction => ({
        orderNumber: transaction.orderNumber,
        transactionId: transaction.transactionId,
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        paymentMethod: transaction.paymentMethod,
        paymentProvider: transaction.paymentProvider,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        processedAt: transaction.processedAt || '',
        failedAt: transaction.failedAt || '',
        refundAmount: transaction.refundAmount || 0,
        refundReason: transaction.refundReason || '',
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      }));

      const fileName = `transactions_${new Date().toISOString().split('T')[0]}`;
      
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
        description: `Transactions exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export transactions data",
        variant: "destructive",
      });
    }
  };

  interface CreateMethodData {
    name: string;
    nameEn?: string;
    nameJa?: string;
    description: string;
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
    provider: string;
    processingFee: number;
    minAmount: number;
    maxAmount: number;
    supportedCurrencies: string[];
    isActive: boolean;
  }

  const handleCreateMethod = async (methodData: CreateMethodData) => {
    try {
      setIsSubmitting(true);
      const response = await api.createAdminPaymentMethod(methodData);
      
      // Ensure the method object has all required properties
      const newMethod: AdminPaymentMethod = {
        _id: response.method?._id || Date.now().toString(),
        name: response.method?.name || methodData.name || 'Unknown',
        nameEn: response.method?.nameEn || methodData.nameEn || '',
        nameJa: response.method?.nameJa || methodData.nameJa || '',
        description: response.method?.description || methodData.description || '',
        type: (response.method?.type || methodData.type || 'credit_card') as 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto',
        provider: response.method?.provider || methodData.provider || 'Unknown',
        processingFee: response.method?.processingFee || methodData.processingFee || 0,
        minAmount: response.method?.minAmount || methodData.minAmount || 0,
        maxAmount: response.method?.maxAmount || methodData.maxAmount || 0,
        supportedCurrencies: response.method?.supportedCurrencies || methodData.supportedCurrencies || ['USD'],
        isActive: response.method?.isActive !== undefined ? response.method.isActive : (methodData.isActive !== undefined ? methodData.isActive : true),
        createdAt: response.method?.createdAt || new Date().toISOString(),
        updatedAt: response.method?.updatedAt || new Date().toISOString()
      };
      
      setPaymentMethods(prev => [newMethod, ...prev]);
      setIsCreateMethodDialogOpen(false);
      toast({
        title: "Success",
        description: "Payment method created successfully",
      });
    } catch (error) {
      console.error('Error creating payment method:', error);
      toast({
        title: "Error",
        description: "Failed to create payment method",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMethod = async (id: string, methodData: CreateMethodData) => {
    try {
      setIsSubmitting(true);
      const response = await api.updateAdminPaymentMethod(id, methodData);
      setPaymentMethods(prev => 
        prev.map(method => method._id === id ? response.method : method)
      );
      setIsEditMethodDialogOpen(false);
      setEditingMethod(null);
      toast({
        title: "Success",
        description: "Payment method updated successfully",
      });
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await api.deleteAdminPaymentMethod(id);
      setPaymentMethods(prev => prev.filter(method => method._id !== id));
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  const handleProcessRefundSubmit = async (refundData: { amount: number; reason: string }) => {
    if (!selectedTransaction) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.processRefund(selectedTransaction._id, refundData);
      setRefunds(prev => [response.refund, ...prev]);
      setIsRefundDialogOpen(false);
      setSelectedTransaction(null);
      toast({
        title: "Success",
        description: "Refund request submitted successfully",
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use stats from API instead of calculating from transactions

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdminUser(user))) {
      window.location.href = '/admin/login';
    }
  }, [authLoading, isAuthenticated, user]);

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdminUser(user)) {
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
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t.exportTransactions}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportTransactions('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTransactions('excel')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTransactions('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleImport}
              style={{ display: 'none' }}
              id="payments-import"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('payments-import')?.click()}
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
              <CreditCard className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalTransactions}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.completedTransactions}</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.failedTransactions}</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalAmount}</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount, language)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Processing Fee</TableHead>
                <TableHead>Min/Max Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods?.length > 0 ? (
                paymentMethods.map((method) => (
                  <TableRow key={method._id}>
                    <TableCell className="font-medium">
                      {getMethodName(method)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {method.type || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{method.provider || 'Unknown'}</TableCell>
                    <TableCell>{method.processingFee || 0}%</TableCell>
                    <TableCell>
                      {formatCurrency(method.minAmount || 0, language)} - {formatCurrency(method.maxAmount || 0, language)}
                    </TableCell>
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No payment methods found
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
                <SelectItem value="processing">{t.processing}</SelectItem>
                <SelectItem value="completed">{t.completed}</SelectItem>
                <SelectItem value="failed">{t.failed}</SelectItem>
                <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                <SelectItem value="refunded">{t.refunded}</SelectItem>
                <SelectItem value="partially_refunded">{t.partiallyRefunded}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map(method => (
                  <SelectItem key={method._id} value={method.name}>
                    {getMethodName(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noTransactions}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.orderNumber}</TableHead>
                  <TableHead>{t.transactionId}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.method}</TableHead>
                  <TableHead>{t.amount}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.processedAt}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="font-mono">{transaction.orderNumber}</TableCell>
                    <TableCell className="font-mono">{transaction.transactionId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.customerName}</div>
                        <div className="text-sm text-muted-foreground">{transaction.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.paymentMethod}</div>
                        <div className="text-sm text-muted-foreground">{transaction.paymentProvider}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount, language)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {transaction.processedAt 
                        ? new Date(transaction.processedAt).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t.viewDetails}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTransactionStatus(transaction)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          {transaction.status === 'completed' && (
                            <DropdownMenuItem onClick={() => handleProcessRefund(transaction)}>
                              <TrendingDown className="h-4 w-4 mr-2" />
                              {t.processRefund}
                            </DropdownMenuItem>
                          )}
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

      {/* Refunds Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.refunds}</CardTitle>
        </CardHeader>
        <CardContent>
          {refunds.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No refunds found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>{t.refundAmount}</TableHead>
                  <TableHead>{t.refundReason}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund._id}>
                    <TableCell className="font-mono">{refund.transactionId}</TableCell>
                    <TableCell className="font-mono">{refund.orderId}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(refund.amount, language)}
                    </TableCell>
                    <TableCell>{refund.reason}</TableCell>
                    <TableCell>
                      <Badge variant={refund.status === 'approved' ? 'default' : 'secondary'}>
                        {refund.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{refund.requestedBy}</TableCell>
                    <TableCell>
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.processRefund}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium">Transaction Details</h3>
                <p className="text-sm text-muted-foreground">
                  Order: {selectedTransaction.orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(selectedTransaction.amount, language)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Customer: {selectedTransaction.customerName}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.refundAmount}</label>
                <Input
                  type="number"
                  placeholder="Enter refund amount"
                  max={selectedTransaction.amount}
                  onChange={(e) => setRefundData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.refundReason}</label>
                <Input
                  placeholder="Enter refund reason"
                  onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRefundDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  {t.cancel}
                </Button>
                <Button 
                  onClick={() => handleProcessRefundSubmit(refundData)}
                  disabled={isSubmitting || !refundData.amount || !refundData.reason}
                >
                  {isSubmitting ? "Processing..." : t.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Transaction Status Dialog */}
      <Dialog open={isUpdateTransactionDialogOpen} onOpenChange={setIsUpdateTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium">Transaction Details</h3>
                <p className="text-sm text-muted-foreground">
                  Order: {selectedTransaction.orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {selectedTransaction.transactionId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(selectedTransaction.amount, language)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Current Status: {selectedTransaction.status}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select 
                    value={transactionUpdateData.status} 
                    onValueChange={(value) => setTransactionUpdateData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    placeholder="Enter additional notes"
                    value={transactionUpdateData.notes}
                    onChange={(e) => setTransactionUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUpdateTransactionDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleTransactionStatusUpdateSubmit}
                  disabled={isSubmitting || !transactionUpdateData.status}
                >
                  {isSubmitting ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Payment Method Dialog */}
      <Dialog open={isCreateMethodDialogOpen} onOpenChange={setIsCreateMethodDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payment Method</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const methodData: CreateMethodData = {
              name: formData.get('name') as string,
              nameEn: formData.get('nameEn') as string,
              nameJa: formData.get('nameJa') as string,
              description: formData.get('description') as string,
              type: formData.get('type') as 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto',
              provider: formData.get('provider') as string,
              processingFee: parseFloat(formData.get('processingFee') as string),
              minAmount: parseFloat(formData.get('minAmount') as string),
              maxAmount: parseFloat(formData.get('maxAmount') as string),
              supportedCurrencies: (formData.get('supportedCurrencies') as string).split(',').map(c => c.trim()),
              isActive: formData.get('isActive') === 'on'
            };
            handleCreateMethod(methodData);
          }}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name (VI) *</label>
                    <Input name="name" placeholder="Enter payment method name" required />
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
                </div>
              </div>

              {/* Payment Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type *</label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="e_wallet">Digital Wallet</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider *</label>
                    <Input name="provider" placeholder="Enter provider name" required />
                  </div>
                </div>
              </div>

              {/* Financial Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Processing Fee (%)</label>
                    <Input name="processingFee" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Amount</label>
                    <Input name="minAmount" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Amount</label>
                    <Input name="maxAmount" type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Supported Currencies</label>
                    <Input name="supportedCurrencies" placeholder="USD, VND, JPY" defaultValue="USD" />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4" />
                    <label className="text-sm font-medium">Active</label>
                  </div>
                </div>
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

      {/* Edit Payment Method Dialog */}
      <Dialog open={isEditMethodDialogOpen} onOpenChange={setIsEditMethodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
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
                type: formData.get('type') as 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto',
                provider: formData.get('provider') as string,
                processingFee: parseFloat(formData.get('processingFee') as string),
                minAmount: parseFloat(formData.get('minAmount') as string),
                maxAmount: parseFloat(formData.get('maxAmount') as string),
                supportedCurrencies: (formData.get('supportedCurrencies') as string).split(',').map(c => c.trim()),
                isActive: formData.get('isActive') === 'on'
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
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                      <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                      <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider</label>
                  <Input name="provider" defaultValue={editingMethod.provider} required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Processing Fee (%)</label>
                  <Input name="processingFee" type="number" step="0.01" defaultValue={editingMethod.processingFee} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Amount</label>
                  <Input name="minAmount" type="number" step="0.01" defaultValue={editingMethod.minAmount} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Amount</label>
                  <Input name="maxAmount" type="number" step="0.01" defaultValue={editingMethod.maxAmount} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Supported Currencies</label>
                  <Input name="supportedCurrencies" defaultValue={editingMethod.supportedCurrencies?.join(', ') || 'USD'} />
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
