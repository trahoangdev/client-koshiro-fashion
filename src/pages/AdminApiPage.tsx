import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, ApiKey, Integration, ApiLog } from "@/lib/api";
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
  Key,
  Globe,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Zap,
  Shield,
  Database,
  Server,
  Code,
  Link,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";


export default function AdminApiPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ApiLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState(false);
  const [isCreateIntegrationDialogOpen, setIsCreateIntegrationDialogOpen] = useState(false);
  const [isEditKeyDialogOpen, setIsEditKeyDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    rateLimit: 1000,
    expiresAt: ''
  });
  const [newIntegrationData, setNewIntegrationData] = useState({
    name: '',
    provider: '',
    type: 'payment' as 'payment' | 'shipping' | 'email' | 'sms' | 'analytics' | 'social' | 'other',
    description: '',
    webhookUrl: '',
    config: '{}'
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [apiKeysResponse, integrationsResponse, logsResponse, statsResponse] = await Promise.all([
        api.getApiKeys({ page: 1, limit: 10 }),
        api.getIntegrations({ page: 1, limit: 10 }),
        api.getApiLogs({ page: 1, limit: 50 }),
        api.getApiStats()
      ]);

      if (apiKeysResponse.success) {
        setApiKeys(apiKeysResponse.data.apiKeys);
      }
      if (integrationsResponse.success) {
        setIntegrations(integrationsResponse.data.integrations);
      }
      if (logsResponse.success) {
        setApiLogs(logsResponse.data.logs);
        setFilteredLogs(logsResponse.data.logs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApiKey = async (data: {
    name: string;
    description: string;
    permissions: string[];
    rateLimit?: number;
    expiresAt?: string;
  }) => {
    try {
      setIsSubmitting(true);
      const response = await api.createApiKey(data);
      if (response.success) {
        toast({ title: "Success", description: "API key created successfully" });
        setIsCreateKeyDialogOpen(false);
        loadData();
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.createApiKey({
        name: newKeyData.name,
        description: newKeyData.description,
        permissions: newKeyData.permissions,
        rateLimit: newKeyData.rateLimit,
        expiresAt: newKeyData.expiresAt || undefined
      });
      if (response.success) {
        toast({ title: "Success", description: "API key created successfully" });
        setIsCreateKeyDialogOpen(false);
        setNewKeyData({
          name: '',
          description: '',
          permissions: [],
          rateLimit: 1000,
          expiresAt: ''
        });
        loadData();
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create API key" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateIntegration = async () => {
    try {
      setIsSubmitting(true);
      
      // Parse config JSON
      let parsedConfig = {};
      try {
        parsedConfig = JSON.parse(newIntegrationData.config);
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON configuration",
          variant: "destructive"
        });
        return;
      }
      
      const response = await api.createIntegration({
        name: newIntegrationData.name,
        provider: newIntegrationData.provider,
        type: newIntegrationData.type,
        description: newIntegrationData.description,
        webhookUrl: newIntegrationData.webhookUrl || undefined,
        config: parsedConfig
      });
      
      if (response.success) {
        toast({ title: "Success", description: "Integration created successfully" });
        setIsCreateIntegrationDialogOpen(false);
        setNewIntegrationData({
          name: '',
          provider: '',
          type: 'payment',
          description: '',
          webhookUrl: '',
          config: '{}'
        });
        loadData();
      }
    } catch (error) {
      console.error("Error creating integration:", error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create integration" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateApiKey = async (id: string, data: Partial<ApiKey>) => {
    try {
      setIsSubmitting(true);
      const response = await api.updateApiKey(id, data);
      if (response.success) {
        toast({ title: "Success", description: "API key updated successfully" });
        setIsEditKeyDialogOpen(false);
        setEditingKey(null);
        loadData();
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await api.deleteApiKey(id);
      if (response.success) {
        toast({ title: "Success", description: "API key deleted successfully" });
        setIsDeleteDialogOpen(false);
        setKeyToDelete(null);
        loadData();
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateApiKey = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await api.regenerateApiKey(id);
      if (response.success) {
        toast({ title: "Success", description: "API key regenerated successfully" });
        loadData();
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate API key",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Success", description: "API key copied to clipboard" });
  };

  const handleTestIntegration = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await api.testIntegration(id);
      if (response.success) {
        toast({ 
          title: "Success", 
          description: response.data.success ? "Connection test successful" : "Connection test failed" 
        });
        loadData();
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({
        title: "Error",
        description: "Failed to test integration",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncIntegration = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await api.syncIntegration(id);
      if (response.success) {
        toast({ 
          title: "Success", 
          description: response.data.success ? "Sync completed successfully" : "Sync failed" 
        });
        loadData();
      }
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast({
        title: "Error",
        description: "Failed to sync integration",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.clearApiLogs();
      if (response.success) {
        toast({ 
          title: "Success", 
          description: `${response.data.deletedCount} logs deleted successfully` 
        });
        loadData();
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast({
        title: "Error",
        description: "Failed to clear logs",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export/Import handlers
  const handleExport = async () => {
    try {
      setIsSubmitting(true);
      const blob = await api.exportApiKeys(exportFormat, includeInactive);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `api-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Export completed successfully" });
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const text = await importFile.text();
      const data = JSON.parse(text);
      
      const response = await api.importApiKeys(data, false);
      if (response.success) {
        toast({ title: "Success", description: response.message });
        setIsImportDialogOpen(false);
        setImportFile(null);
        loadData();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Error",
        description: "Failed to import data. Please check file format.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const translations = {
    en: {
      title: "API & Integration Management",
      subtitle: "Manage API keys, integrations, and monitor API usage",
      createKey: "Create API Key",
      createIntegration: "Create Integration",
      export: "Export",
      import: "Import",
      search: "Search...",
      apiKeys: "API Keys",
      integrations: "Integrations",
      apiLogs: "API Logs",
      name: "Name",
      key: "Key",
      permissions: "Permissions",
      status: "Status",
      usage: "Usage",
      lastUsed: "Last Used",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      expired: "Expired",
      payment: "Payment",
      shipping: "Shipping",
      email: "Email",
      sms: "SMS",
      analytics: "Analytics",
      social: "Social",
      other: "Other",
      noKeys: "No API keys found",
      noIntegrations: "No integrations found",
      noLogs: "No API logs found",
      totalKeys: "Total Keys",
      activeKeys: "Active Keys",
      totalIntegrations: "Total Integrations",
      activeIntegrations: "Active Integrations",
      totalRequests: "Total Requests",
      successRate: "Success Rate",
      copyKey: "Copy Key",
      regenerateKey: "Regenerate Key",
      viewLogs: "View Logs",
      testConnection: "Test Connection",
      syncNow: "Sync Now",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      generateNewKey: "Generate New Key",
      keyDescription: "Key Description",
      selectPermissions: "Select Permissions",
      integrationName: "Integration Name",
      integrationType: "Integration Type",
      provider: "Provider",
      configuration: "Configuration",
      endpoint: "Endpoint",
      method: "Method",
      statusCode: "Status Code",
      responseTime: "Response Time",
      ipAddress: "IP Address",
      timestamp: "Timestamp",
      exportLogs: "Export Logs",
      clearLogs: "Clear Logs"
    },
    vi: {
      title: "Quản lý API & Tích hợp",
      subtitle: "Quản lý API keys, tích hợp và giám sát sử dụng API",
      createKey: "Tạo API Key",
      createIntegration: "Tạo Tích hợp",
      export: "Xuất",
      import: "Nhập",
      search: "Tìm kiếm...",
      apiKeys: "API Keys",
      integrations: "Tích hợp",
      apiLogs: "Logs API",
      name: "Tên",
      key: "Key",
      permissions: "Quyền hạn",
      status: "Trạng thái",
      usage: "Sử dụng",
      lastUsed: "Sử dụng cuối",
      actions: "Thao tác",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      expired: "Hết hạn",
      payment: "Thanh toán",
      shipping: "Vận chuyển",
      email: "Email",
      sms: "SMS",
      analytics: "Phân tích",
      social: "Mạng xã hội",
      other: "Khác",
      noKeys: "Không tìm thấy API key",
      noIntegrations: "Không tìm thấy tích hợp",
      noLogs: "Không tìm thấy logs API",
      totalKeys: "Tổng Keys",
      activeKeys: "Keys hoạt động",
      totalIntegrations: "Tổng tích hợp",
      activeIntegrations: "Tích hợp hoạt động",
      totalRequests: "Tổng yêu cầu",
      successRate: "Tỷ lệ thành công",
      copyKey: "Sao chép Key",
      regenerateKey: "Tạo lại Key",
      viewLogs: "Xem Logs",
      testConnection: "Test kết nối",
      syncNow: "Đồng bộ ngay",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      save: "Lưu",
      cancel: "Hủy",
      generateNewKey: "Tạo Key mới",
      keyDescription: "Mô tả Key",
      selectPermissions: "Chọn quyền hạn",
      integrationName: "Tên tích hợp",
      integrationType: "Loại tích hợp",
      provider: "Nhà cung cấp",
      configuration: "Cấu hình",
      endpoint: "Endpoint",
      method: "Method",
      statusCode: "Mã trạng thái",
      responseTime: "Thời gian phản hồi",
      ipAddress: "Địa chỉ IP",
      timestamp: "Thời gian",
      exportLogs: "Xuất Logs",
      clearLogs: "Xóa Logs"
    },
    ja: {
      title: "API・統合管理",
      subtitle: "APIキー、統合の管理、API使用状況の監視",
      createKey: "APIキー作成",
      createIntegration: "統合作成",
      export: "エクスポート",
      import: "インポート",
      search: "検索...",
      apiKeys: "APIキー",
      integrations: "統合",
      apiLogs: "APIログ",
      name: "名前",
      key: "キー",
      permissions: "権限",
      status: "ステータス",
      usage: "使用",
      lastUsed: "最終使用",
      actions: "アクション",
      active: "アクティブ",
      inactive: "非アクティブ",
      expired: "期限切れ",
      payment: "支払い",
      shipping: "配送",
      email: "メール",
      sms: "SMS",
      analytics: "分析",
      social: "ソーシャル",
      other: "その他",
      noKeys: "APIキーが見つかりません",
      noIntegrations: "統合が見つかりません",
      noLogs: "APIログが見つかりません",
      totalKeys: "総キー数",
      activeKeys: "アクティブキー",
      totalIntegrations: "総統合数",
      activeIntegrations: "アクティブ統合",
      totalRequests: "総リクエスト数",
      successRate: "成功率",
      copyKey: "キーコピー",
      regenerateKey: "キー再生成",
      viewLogs: "ログ表示",
      testConnection: "接続テスト",
      syncNow: "今すぐ同期",
      edit: "編集",
      delete: "削除",
      save: "保存",
      cancel: "キャンセル",
      generateNewKey: "新しいキー生成",
      keyDescription: "キー説明",
      selectPermissions: "権限選択",
      integrationName: "統合名",
      integrationType: "統合タイプ",
      provider: "プロバイダー",
      configuration: "設定",
      endpoint: "エンドポイント",
      method: "メソッド",
      statusCode: "ステータスコード",
      responseTime: "レスポンス時間",
      ipAddress: "IPアドレス",
      timestamp: "タイムスタンプ",
      exportLogs: "ログエクスポート",
      clearLogs: "ログクリア"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;


  // Filter logs
  useEffect(() => {
    let filtered = apiLogs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.apiKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      const statusCode = filterStatus === "success" ? 200 : 
                        filterStatus === "error" ? 400 : 0;
      filtered = filtered.filter(log => 
        filterStatus === "success" ? log.statusCode >= 200 && log.statusCode < 300 :
        filterStatus === "error" ? log.statusCode >= 400 :
        true
      );
    }

    setFilteredLogs(filtered);
  }, [apiLogs, searchTerm, filterStatus]);

  const getIntegrationName = (integration: Integration) => {
    switch (language) {
      case 'vi': return integration.name;
      case 'ja': return integration.nameJa || integration.name;
      default: return integration.nameEn || integration.name;
    }
  };

  const getIntegrationDescription = (integration: Integration) => {
    switch (language) {
      case 'vi': return integration.description;
      case 'ja': return integration.descriptionJa || integration.description;
      default: return integration.descriptionEn || integration.description;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'payment': return t.payment;
      case 'shipping': return t.shipping;
      case 'email': return t.email;
      case 'sms': return t.sms;
      case 'analytics': return t.analytics;
      case 'social': return t.social;
      case 'other': return t.other;
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t.active}</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />{t.inactive}</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusCodeBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge variant="default" className="bg-green-500">{statusCode}</Badge>;
    } else if (statusCode >= 400) {
      return <Badge variant="destructive">{statusCode}</Badge>;
    } else {
      return <Badge variant="outline">{statusCode}</Badge>;
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleRegenerateKey = async (keyId: string) => {
    await handleRegenerateApiKey(keyId);
  };

  const handleTestConnection = async (integrationId: string) => {
    await handleTestIntegration(integrationId);
  };

  const handleSyncNow = async (integrationId: string) => {
    await handleSyncIntegration(integrationId);
  };

  const handleDeleteKey = (key: ApiKey) => {
    setKeyToDelete(key);
    setIsDeleteDialogOpen(true);
  };

  const stats = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.isActive).length,
    totalIntegrations: integrations.length,
    activeIntegrations: integrations.filter(i => i.status === 'active').length,
    totalRequests: apiLogs.length,
    successRate: apiLogs.length > 0 ? 
      Math.round((apiLogs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length / apiLogs.length) * 100) : 0
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
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setIsCreateIntegrationDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createIntegration}
            </Button>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              {t.import}
            </Button>
            <Button onClick={() => setIsCreateKeyDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createKey}
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalKeys}</p>
                <p className="text-2xl font-bold">{stats.totalKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.activeKeys}</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Link className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalIntegrations}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalIntegrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalRequests}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.successRate}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.apiKeys}</CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noKeys}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.key}</TableHead>
                  <TableHead>{t.permissions}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.usage}</TableHead>
                  <TableHead>{t.lastUsed}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{key.name}</div>
                        <div className="text-sm text-muted-foreground">{key.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {key.key.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(key.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.slice(0, 2).map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {key.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{key.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.isActive ? 
                        <Badge variant="default" className="bg-green-500">{t.active}</Badge> :
                        <Badge variant="secondary">{t.inactive}</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>{key.usageCount.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.lastUsed ? 
                        new Date(key.lastUsed).toLocaleDateString() : 
                        'Never'
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
                          <DropdownMenuItem onClick={() => handleCopyKey(key.key)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t.copyKey}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRegenerateKey(key._id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t.regenerateKey}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteKey(key)}>
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

      {/* Integrations Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.integrations}</CardTitle>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noIntegrations}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.integrationType}</TableHead>
                  <TableHead>{t.provider}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getIntegrationName(integration)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getIntegrationDescription(integration)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(integration.type)}</Badge>
                    </TableCell>
                    <TableCell>{integration.provider}</TableCell>
                    <TableCell>{getStatusBadge(integration.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${integration.successCount + integration.errorCount > 0 ? 
                                (integration.successCount / (integration.successCount + integration.errorCount)) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {integration.successCount + integration.errorCount > 0 ? 
                            Math.round((integration.successCount / (integration.successCount + integration.errorCount)) * 100) : 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {integration.lastSync ? 
                        new Date(integration.lastSync).toLocaleDateString() : 
                        'Never'
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
                          <DropdownMenuItem onClick={() => handleTestConnection(integration._id)}>
                            <Zap className="h-4 w-4 mr-2" />
                            {t.testConnection}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSyncNow(integration._id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t.syncNow}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            {t.edit}
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

      {/* API Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.apiLogs}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t.exportLogs}
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                {t.clearLogs}
              </Button>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noLogs}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.endpoint}</TableHead>
                  <TableHead>{t.method}</TableHead>
                  <TableHead>{t.statusCode}</TableHead>
                  <TableHead>{t.responseTime}</TableHead>
                  <TableHead>{t.ipAddress}</TableHead>
                  <TableHead>{t.timestamp}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.slice(0, 20).map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-sm">{log.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.method}</Badge>
                    </TableCell>
                    <TableCell>{getStatusCodeBadge(log.statusCode)}</TableCell>
                    <TableCell>{log.responseTime}ms</TableCell>
                    <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the API key "{keyToDelete?.name}"? 
              This action cannot be undone and will break any applications using this key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (keyToDelete) {
                  setApiKeys(prev => prev.filter(k => k._id !== keyToDelete._id));
                  toast({
                    title: "API Key deleted",
                    description: `API key "${keyToDelete.name}" has been deleted.`,
                  });
                }
                setIsDeleteDialogOpen(false);
                setKeyToDelete(null);
              }}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create API Key Dialog */}
      <Dialog open={isCreateKeyDialogOpen} onOpenChange={setIsCreateKeyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.createKey}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input 
                id="keyName"
                placeholder="API key name" 
                value={newKeyData.name}
                onChange={(e) => setNewKeyData({...newKeyData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Input 
                id="keyDescription"
                placeholder="API key description" 
                value={newKeyData.description}
                onChange={(e) => setNewKeyData({...newKeyData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Permissions *</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  'products:read', 'products:write', 'orders:read', 'orders:write',
                  'users:read', 'users:write', 'categories:read', 'categories:write'
                ].map(permission => (
                  <label key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newKeyData.permissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewKeyData({
                            ...newKeyData,
                            permissions: [...newKeyData.permissions, permission]
                          });
                        } else {
                          setNewKeyData({
                            ...newKeyData,
                            permissions: newKeyData.permissions.filter(p => p !== permission)
                          });
                        }
                      }}
                    />
                    <span className="text-sm">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Rate Limit (requests/hour)</label>
                <Input 
                  type="number"
                  placeholder="1000" 
                  value={newKeyData.rateLimit || ''}
                  onChange={(e) => setNewKeyData({...newKeyData, rateLimit: parseInt(e.target.value) || 1000})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Expires At (optional)</label>
                <Input 
                  type="datetime-local"
                  value={newKeyData.expiresAt || ''}
                  onChange={(e) => setNewKeyData({...newKeyData, expiresAt: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={isSubmitting || !newKeyData.name || !newKeyData.description || newKeyData.permissions.length === 0}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Integration Dialog */}
        <Dialog open={isCreateIntegrationDialogOpen} onOpenChange={setIsCreateIntegrationDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.createIntegration}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input 
                      placeholder="Integration name" 
                      value={newIntegrationData.name}
                      onChange={(e) => setNewIntegrationData({...newIntegrationData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Provider *</label>
                    <Input 
                      placeholder="Provider name" 
                      value={newIntegrationData.provider}
                      onChange={(e) => setNewIntegrationData({...newIntegrationData, provider: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <Select 
                    value={newIntegrationData.type} 
                    onValueChange={(value: 'payment' | 'shipping' | 'email' | 'sms' | 'analytics' | 'social' | 'other') => 
                      setNewIntegrationData({...newIntegrationData, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="shipping">Shipping</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="w-full p-3 border rounded-md min-h-[80px] resize-none" 
                    placeholder="Integration description" 
                    value={newIntegrationData.description}
                    onChange={(e) => setNewIntegrationData({...newIntegrationData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <Input 
                    placeholder="https://example.com/webhook" 
                    value={newIntegrationData.webhookUrl}
                    onChange={(e) => setNewIntegrationData({...newIntegrationData, webhookUrl: e.target.value})}
                  />
                </div>
              </div>
              {/* Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration (JSON)</h3>
                
                {/* Demo Configuration Buttons */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">💳 Payment Gateways</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "pk_test_51234567890abcdef",
                          secretKey: "sk_test_51234567890abcdef",
                          webhookSecret: "whsec_1234567890abcdef",
                          endpoint: "https://api.stripe.com/v1",
                          timeout: 30000,
                          retries: 3,
                          currency: "USD",
                          supportedMethods: ["card", "bank_transfer", "wallet"],
                          webhookEvents: ["payment_intent.succeeded", "payment_intent.payment_failed"]
                        }, null, 2)})}
                      >
                        Stripe Payment
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "your-paypal-client-id",
                          secret: "your-paypal-secret",
                          environment: "sandbox",
                          webhookId: "webhook-123456",
                          currency: "USD",
                          returnUrl: "https://yourstore.com/payment/success",
                          cancelUrl: "https://yourstore.com/payment/cancel"
                        }, null, 2)})}
                      >
                        PayPal
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🚚 Shipping Services</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "your-fedex-key",
                          secretKey: "your-fedex-secret",
                          accountNumber: "123456789",
                          meterNumber: "987654321",
                          environment: "production",
                          serviceTypes: ["FEDEX_GROUND", "FEDEX_EXPRESS_SAVER"],
                          packagingTypes: ["YOUR_PACKAGING", "FEDEX_BOX"]
                        }, null, 2)})}
                      >
                        FedEx Shipping
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "your-ups-key",
                          username: "your-ups-username",
                          password: "your-ups-password",
                          accountNumber: "UPS123456",
                          environment: "production",
                          serviceCodes: ["03", "12", "01"],
                          packagingTypes: ["02", "01", "04"]
                        }, null, 2)})}
                      >
                        UPS Shipping
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📧 Email Services</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "your-sendgrid-key",
                          fromEmail: "noreply@yourstore.com",
                          fromName: "Your Store",
                          replyTo: "support@yourstore.com",
                          templates: {
                            welcome: "d-1234567890abcdef",
                            orderConfirmation: "d-0987654321fedcba",
                            passwordReset: "d-1122334455667788"
                          },
                          categories: ["transactional", "marketing"],
                          trackingSettings: {
                            clickTracking: true,
                            openTracking: true,
                            subscriptionTracking: true
                          }
                        }, null, 2)})}
                      >
                        SendGrid Email
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "your-mailgun-key",
                          domain: "mg.yourstore.com",
                          fromEmail: "noreply@mg.yourstore.com",
                          fromName: "Your Store",
                          webhookSigningKey: "key-1234567890abcdef",
                          templates: {
                            welcome: "welcome-template",
                            orderConfirmation: "order-template"
                          }
                        }, null, 2)})}
                      >
                        Mailgun Email
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📊 Analytics & Tracking</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          trackingId: "GA-123456789-1",
                          measurementId: "G-XXXXXXXXXX",
                          apiSecret: "your-ga4-secret",
                          customDimensions: {
                            userId: "custom-1",
                            orderValue: "custom-2",
                            customerType: "custom-3"
                          },
                          events: ["purchase", "add_to_cart", "view_item"],
                          enhancedEcommerce: true
                        }, null, 2)})}
                      >
                        Google Analytics
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          pixelId: "123456789012345",
                          accessToken: "your-facebook-token",
                          testEventCode: "TEST12345",
                          events: ["Purchase", "AddToCart", "ViewContent"],
                          customData: {
                            currency: "USD",
                            value: "order_value"
                          }
                        }, null, 2)})}
                      >
                        Facebook Pixel
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📱 SMS & Notifications</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          accountSid: "AC1234567890abcdef",
                          authToken: "your-twilio-auth-token",
                          fromNumber: "+1234567890",
                          messagingServiceSid: "MG1234567890abcdef",
                          webhookUrl: "https://yourstore.com/webhooks/twilio",
                          statusCallback: "https://yourstore.com/webhooks/twilio/status"
                        }, null, 2)})}
                      >
                        Twilio SMS
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "your-slack-bot-token",
                          signingSecret: "your-slack-signing-secret",
                          channel: "#notifications",
                          webhookUrl: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
                          events: ["order.created", "order.updated", "payment.completed"]
                        }, null, 2)})}
                      >
                        Slack Notifications
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "your-discord-bot-token",
                          webhookUrl: "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz1234567890",
                          channelId: "123456789012345678",
                          events: ["order.created", "payment.completed", "user.registered"]
                        }, null, 2)})}
                      >
                        Discord Bot
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🔗 Automation</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewIntegrationData({...newIntegrationData, config: JSON.stringify({
                          apiKey: "your-zapier-webhook-key",
                          webhookUrl: "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
                          events: ["order.created", "customer.registered", "product.updated"],
                          retryPolicy: {
                            maxRetries: 3,
                            retryDelay: 5000
                          }
                        }, null, 2)})}
                      >
                        Zapier Webhook
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* JSON Tools */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(newIntegrationData.config);
                        setNewIntegrationData({...newIntegrationData, config: JSON.stringify(parsed, null, 2)});
                        toast({ title: "Success", description: "JSON formatted successfully" });
                      } catch (error) {
                        toast({ 
                          title: "Error", 
                          description: "Invalid JSON format", 
                          variant: "destructive" 
                        });
                      }
                    }}
                  >
                    Format JSON
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewIntegrationData({...newIntegrationData, config: '{}'})}
                  >
                    Clear
                  </Button>
                </div>
                
                {/* JSON Textarea */}
                <div>
                  <textarea 
                    className="w-full p-3 border rounded-md min-h-[200px] font-mono text-sm resize-none"
                    placeholder='{"apiKey": "your-key", "endpoint": "https://api.example.com"}'
                    value={newIntegrationData.config}
                    onChange={(e) => setNewIntegrationData({...newIntegrationData, config: e.target.value})}
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    💡 Click on the buttons above to load example configurations for different integration types
                  </div>
                </div>
              </div>
            
            {/* Dialog Footer */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateIntegrationDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateIntegration}
                disabled={isSubmitting || !newIntegrationData.name || !newIntegrationData.provider || !newIntegrationData.type}
                className="min-w-[100px]"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.export}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Format</label>
              <Select value={exportFormat} onValueChange={(value: 'json' | 'csv') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeInactive"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              <label htmlFor="includeInactive" className="text-sm">
                Include inactive items
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.import}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select File</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full p-2 border rounded"
              />
              {importFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {importFile.name}
                </p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Supported format: JSON</p>
              <p>File should contain API keys and integrations data.</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isSubmitting || !importFile}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
