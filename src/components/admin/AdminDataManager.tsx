import { useState } from "react";
import { 
  Download,
  Upload,
  FileText,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Trash2,
  Calendar,
  Users,
  Package,
  ShoppingCart,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExportJob {
  id: string;
  type: 'products' | 'orders' | 'customers' | 'categories' | 'all';
  format: 'csv' | 'excel' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

interface ImportJob {
  id: string;
  type: 'products' | 'orders' | 'customers' | 'categories';
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface AdminDataManagerProps {
  onExport: (type: string, format: string) => Promise<void>;
  onImport: (type: string, file: File) => Promise<void>;
  exportJobs: ExportJob[];
  importJobs: ImportJob[];
  onCancelJob: (jobId: string, type: 'export' | 'import') => void;
  onRetryJob: (jobId: string, type: 'export' | 'import') => void;
}

export default function AdminDataManager({
  onExport,
  onImport,
  exportJobs,
  importJobs,
  onCancelJob,
  onRetryJob
}: AdminDataManagerProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<string>('all');
  const [selectedExportFormat, setSelectedExportFormat] = useState<string>('csv');
  const [selectedImportType, setSelectedImportType] = useState<string>('products');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const translations = {
    en: {
      title: 'Data Management',
      export: 'Export Data',
      import: 'Import Data',
      exportTitle: 'Export Data',
      importTitle: 'Import Data',
      selectType: 'Select Data Type',
      selectFormat: 'Select Format',
      selectFile: 'Select File',
      startExport: 'Start Export',
      startImport: 'Start Import',
      cancel: 'Cancel',
      close: 'Close',
      all: 'All Data',
      products: 'Products',
      orders: 'Orders',
      customers: 'Customers',
      categories: 'Categories',
      csv: 'CSV',
      excel: 'Excel',
      json: 'JSON',
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      download: 'Download',
      retry: 'Retry',
      cancelJob: 'Cancel Job',
      noJobs: 'No jobs found',
      exportJobs: 'Export Jobs',
      importJobs: 'Import Jobs',
      progress: 'Progress',
      createdAt: 'Created',
      completedAt: 'Completed',
      error: 'Error',
      success: 'Success',
      fileSelected: 'File selected',
      dragDrop: 'Drag and drop file here, or click to select'
    },
    vi: {
      title: 'Quản lý dữ liệu',
      export: 'Xuất dữ liệu',
      import: 'Nhập dữ liệu',
      exportTitle: 'Xuất dữ liệu',
      importTitle: 'Nhập dữ liệu',
      selectType: 'Chọn loại dữ liệu',
      selectFormat: 'Chọn định dạng',
      selectFile: 'Chọn tệp',
      startExport: 'Bắt đầu xuất',
      startImport: 'Bắt đầu nhập',
      cancel: 'Hủy',
      close: 'Đóng',
      all: 'Tất cả dữ liệu',
      products: 'Sản phẩm',
      orders: 'Đơn hàng',
      customers: 'Khách hàng',
      categories: 'Danh mục',
      csv: 'CSV',
      excel: 'Excel',
      json: 'JSON',
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      failed: 'Thất bại',
      download: 'Tải xuống',
      retry: 'Thử lại',
      cancelJob: 'Hủy công việc',
      noJobs: 'Không có công việc nào',
      exportJobs: 'Công việc xuất',
      importJobs: 'Công việc nhập',
      progress: 'Tiến độ',
      createdAt: 'Tạo lúc',
      completedAt: 'Hoàn thành lúc',
      error: 'Lỗi',
      success: 'Thành công',
      fileSelected: 'Đã chọn tệp',
      dragDrop: 'Kéo và thả tệp vào đây, hoặc click để chọn'
    },
    ja: {
      title: 'データ管理',
      export: 'データをエクスポート',
      import: 'データをインポート',
      exportTitle: 'データをエクスポート',
      importTitle: 'データをインポート',
      selectType: 'データタイプを選択',
      selectFormat: 'フォーマットを選択',
      selectFile: 'ファイルを選択',
      startExport: 'エクスポート開始',
      startImport: 'インポート開始',
      cancel: 'キャンセル',
      close: '閉じる',
      all: 'すべてのデータ',
      products: '商品',
      orders: '注文',
      customers: '顧客',
      categories: 'カテゴリ',
      csv: 'CSV',
      excel: 'Excel',
      json: 'JSON',
      pending: '保留中',
      processing: '処理中',
      completed: '完了',
      failed: '失敗',
      download: 'ダウンロード',
      retry: '再試行',
      cancelJob: 'ジョブをキャンセル',
      noJobs: 'ジョブが見つかりません',
      exportJobs: 'エクスポートジョブ',
      importJobs: 'インポートジョブ',
      progress: '進捗',
      createdAt: '作成日時',
      completedAt: '完了日時',
      error: 'エラー',
      success: '成功',
      fileSelected: 'ファイルが選択されました',
      dragDrop: 'ここにファイルをドラッグ＆ドロップ、またはクリックして選択'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleExport = async () => {
    try {
      await onExport(selectedExportType, selectedExportFormat);
      setIsExportDialogOpen(false);
      toast({
        title: t.success,
        description: 'Export job started successfully',
      });
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to start export job',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: t.error,
        description: 'Please select a file',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onImport(selectedImportType, selectedFile);
      setIsImportDialogOpen(false);
      setSelectedFile(null);
      toast({
        title: t.success,
        description: 'Import job started successfully',
      });
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to start import job',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t.pending, variant: 'secondary' as const },
      processing: { label: t.processing, variant: 'default' as const },
      completed: { label: t.completed, variant: 'default' as const },
      failed: { label: t.failed, variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'products': return <Package className="h-4 w-4" />;
      case 'orders': return <ShoppingCart className="h-4 w-4" />;
      case 'customers': return <Users className="h-4 w-4" />;
      case 'categories': return <Database className="h-4 w-4" />;
      case 'all': return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.exportTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t.selectType}</label>
                <select
                  value={selectedExportType}
                  onChange={(e) => setSelectedExportType(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="all">{t.all}</option>
                  <option value="products">{t.products}</option>
                  <option value="orders">{t.orders}</option>
                  <option value="customers">{t.customers}</option>
                  <option value="categories">{t.categories}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t.selectFormat}</label>
                <select
                  value={selectedExportFormat}
                  onChange={(e) => setSelectedExportFormat(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="csv">{t.csv}</option>
                  <option value="excel">{t.excel}</option>
                  <option value="json">{t.json}</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleExport}>
                  {t.startExport}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              {t.import}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.importTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t.selectType}</label>
                <select
                  value={selectedImportType}
                  onChange={(e) => setSelectedImportType(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="products">{t.products}</option>
                  <option value="orders">{t.orders}</option>
                  <option value="customers">{t.customers}</option>
                  <option value="categories">{t.categories}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t.selectFile}</label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.json"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">{t.dragDrop}</p>
                  </label>
                </div>
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">{t.fileSelected}: {selectedFile.name}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleImport} disabled={!selectedFile}>
                  {t.startImport}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Export Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t.exportJobs}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t.noJobs}</p>
          ) : (
            <div className="space-y-4">
              {exportJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(job.type)}
                    <div>
                      <p className="font-medium">{job.type} - {job.format.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    {job.status === 'processing' && (
                      <Progress value={job.progress} className="w-20" />
                    )}
                    {job.status === 'completed' && job.downloadUrl && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        {t.download}
                      </Button>
                    )}
                    {job.status === 'failed' && (
                      <Button size="sm" variant="outline" onClick={() => onRetryJob(job.id, 'export')}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        {t.retry}
                      </Button>
                    )}
                    {(job.status === 'pending' || job.status === 'processing') && (
                      <Button size="sm" variant="outline" onClick={() => onCancelJob(job.id, 'export')}>
                        <X className="h-4 w-4 mr-1" />
                        {t.cancelJob}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t.importJobs}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {importJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t.noJobs}</p>
          ) : (
            <div className="space-y-4">
              {importJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(job.type)}
                    <div>
                      <p className="font-medium">{job.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.processedRows} / {job.totalRows} rows
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    {job.status === 'processing' && (
                      <Progress value={job.progress} className="w-20" />
                    )}
                    {job.status === 'failed' && (
                      <Button size="sm" variant="outline" onClick={() => onRetryJob(job.id, 'import')}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        {t.retry}
                      </Button>
                    )}
                    {(job.status === 'pending' || job.status === 'processing') && (
                      <Button size="sm" variant="outline" onClick={() => onCancelJob(job.id, 'import')}>
                        <X className="h-4 w-4 mr-1" />
                        {t.cancelJob}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 