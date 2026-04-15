import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, isAdminUser } from "@/contexts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, Category } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";
import { Loader2, ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ProductFormData {
  name: string;
  nameEn: string;
  nameJa: string;
  description: string;
  descriptionEn: string;
  descriptionJa: string;
  price: number;
  originalPrice: number;
  categoryId: string;
  images: string[];
  cloudinaryImages: Array<{
    publicId: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    responsiveUrls: {
      thumbnail: string;
      medium: string;
      large: string;
      original: string;
    };
  }>;
  videos: Array<{
    publicId: string;
    secureUrl: string;
    duration?: number;
    format: string;
    bytes: number;
  }>;
  sizes: string[];
  colors: Array<string | { name: string; value: string }>;
  stock: number;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
  isNew: boolean;
  isLimitedEdition: boolean;
  isBestSeller: boolean;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  sku: string;
  barcode: string;
  materials: string[];
  careInstructions: string;
  careInstructionsEn: string;
  careInstructionsJa: string;
  origin: string;
  originEn: string;
  originJa: string;
}

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const hasLoadedRef = useRef(false);
  const navigateRef = useRef(navigate);
  const toastRef = useRef(toast);

  const mode = id ? 'edit' : 'create';
  const isEditMode = mode === 'edit';

  const translations = {
    en: {
      title: isEditMode ? 'Edit Product' : 'Create New Product',
      back: 'Back to Products',
      loading: 'Loading...',
      error: 'Error',
      success: 'Product saved successfully',
      errorLoading: 'Error loading data',
      errorLoadingDesc: 'Could not load product or categories',
      unsavedChanges: 'Unsaved Changes',
      unsavedChangesDesc: 'You have unsaved changes. Are you sure you want to leave?',
      leave: 'Leave',
      stay: 'Stay',
      draftSaved: 'Draft saved',
      draftSavedDesc: 'Your changes have been saved as draft',
      saving: 'Saving...',
      saved: 'Saved'
    },
    vi: {
      title: isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Tạo Sản Phẩm Mới',
      back: 'Quay lại Sản Phẩm',
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Sản phẩm đã được lưu thành công',
      errorLoading: 'Lỗi tải dữ liệu',
      errorLoadingDesc: 'Không thể tải sản phẩm hoặc danh mục',
      unsavedChanges: 'Thay Đổi Chưa Lưu',
      unsavedChangesDesc: 'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn thoát?',
      leave: 'Thoát',
      stay: 'Ở lại',
      draftSaved: 'Bản nháp đã lưu',
      draftSavedDesc: 'Các thay đổi của bạn đã được lưu dưới dạng bản nháp',
      saving: 'Đang lưu...',
      saved: 'Đã lưu'
    },
    ja: {
      title: isEditMode ? '商品を編集' : '新しい商品を作成',
      back: '商品に戻る',
      loading: '読み込み中...',
      error: 'エラー',
      success: '商品が正常に保存されました',
      errorLoading: 'データ読み込みエラー',
      errorLoadingDesc: '商品またはカテゴリを読み込めませんでした',
      unsavedChanges: '未保存の変更',
      unsavedChangesDesc: '保存されていない変更があります。本当に離れますか？',
      leave: '離れる',
      stay: '残る',
      draftSaved: '下書きが保存されました',
      draftSavedDesc: '変更が下書きとして保存されました',
      saving: '保存中...',
      saved: '保存済み'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Update refs
  navigateRef.current = navigate;
  toastRef.current = toast;

  // Authentication check is handled by ProtectedAdminRoute
  // No need for duplicate authentication logic here


  const saveDraft = useCallback(async () => {
    if (!formData) return;

    try {
      const draftKey = isEditMode ? `product-draft-${id}` : 'product-draft-new';
      localStorage.setItem(draftKey, JSON.stringify({
        ...formData,
        timestamp: Date.now()
      }));
      setIsDraftSaved(true);

      // Show brief notification
      setTimeout(() => setIsDraftSaved(false), 2000);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [formData, isEditMode, id]);

  const loadDraft = useCallback(() => {
    if (isEditMode) return; // Don't load draft for edit mode

    try {
      const draftKey = 'product-draft-new';
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        const draftData = JSON.parse(draft);
        // Check if draft is not too old (24 hours)
        if (Date.now() - draftData.timestamp < 24 * 60 * 60 * 1000) {
          setFormData(draftData);
          setHasUnsavedChanges(true);
          toast({
            title: language === 'vi' ? 'Đã tải bản nháp' :
              language === 'ja' ? '下書きを読み込みました' :
                'Draft loaded',
            description: language === 'vi' ? 'Bản nháp trước đó đã được tải' :
              language === 'ja' ? '以前の下書きが読み込まれました' :
                'Previous draft has been loaded',
          });
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, [isEditMode, language, toast]);

  // Reset load flag when id changes
  useEffect(() => {
    hasLoadedRef.current = false;
  }, [id]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load categories
        const categoriesResponse = await api.getCategories();
        setCategories(categoriesResponse.categories);

        // Load product data if editing
        if (isEditMode && id) {
          try {
            const productResponse = await api.getProduct(id);
            const product = productResponse.product;

            // Transform product data to form format
            const transformedData: ProductFormData = {
              name: product.name,
              nameEn: product.nameEn || '',
              nameJa: product.nameJa || '',
              description: product.description || '',
              descriptionEn: product.descriptionEn || '',
              descriptionJa: product.descriptionJa || '',
              price: product.price,
              originalPrice: product.originalPrice || 0,
              categoryId: typeof product.categoryId === 'string' ? product.categoryId : product.categoryId._id,
              images: product.images || [],
              cloudinaryImages: product.cloudinaryImages || [],
              videos: product.videos?.map(video => ({
                publicId: video.publicId || '',
                secureUrl: video.secureUrl || video.url || '',
                duration: video.duration,
                format: video.format || '',
                bytes: video.bytes || 0
              })).filter(video => video.publicId && video.secureUrl) || [],
              sizes: product.sizes || [],
              colors: product.colors || [],
              stock: product.stock,
              tags: product.tags || [],
              isActive: product.isActive,
              isFeatured: product.isFeatured,
              onSale: product.onSale,
              isNew: product.isNew,
              isLimitedEdition: product.isLimitedEdition,
              isBestSeller: product.isBestSeller,
              metaTitle: product.metaTitle || '',
              metaDescription: product.metaDescription || '',
              slug: product.slug || '',
              weight: product.weight || 0,
              dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
              sku: product.sku || '',
              barcode: product.barcode || '',
              materials: product.materials || [],
              careInstructions: product.careInstructions || '',
              careInstructionsEn: product.careInstructionsEn || '',
              careInstructionsJa: product.careInstructionsJa || '',
              origin: product.origin || '',
              originEn: product.originEn || '',
              originJa: product.originJa || ''
            };

            setFormData(transformedData);
          } catch (error) {
            console.error('Error loading product:', error);
            toastRef.current({
              title: t.errorLoading,
              description: t.errorLoadingDesc,
              variant: "destructive",
            });
            navigateRef.current('/admin/products');
          }
        } else {
          // Create mode - set default form data
          const defaultData: ProductFormData = {
            name: '',
            nameEn: '',
            nameJa: '',
            description: '',
            descriptionEn: '',
            descriptionJa: '',
            price: 0,
            originalPrice: 0,
            categoryId: '',
            images: [],
            cloudinaryImages: [],
            videos: [],
            sizes: [],
            colors: [],
            stock: 0,
            tags: [],
            isActive: true,
            isFeatured: false,
            onSale: false,
            isNew: true, // New products are automatically new
            isLimitedEdition: false,
            isBestSeller: false,
            metaTitle: '',
            metaDescription: '',
            slug: '',
            weight: 0,
            dimensions: { length: 0, width: 0, height: 0 },
            sku: '',
            barcode: '',
            materials: [],
            careInstructions: '',
            careInstructionsEn: '',
            careInstructionsJa: '',
            origin: '',
            originEn: '',
            originJa: ''
          };
          setFormData(defaultData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toastRef.current({
          title: t.errorLoading,
          description: t.errorLoadingDesc,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated && isAdminUser(user) && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
  }, [authLoading, isAuthenticated, user, id, isEditMode, t.errorLoading, t.errorLoadingDesc]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges && formData) {
      const interval = setInterval(() => {
        saveDraft();
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [hasUnsavedChanges, formData, saveDraft]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const clearDraft = () => {
    const draftKey = isEditMode ? `product-draft-${id}` : 'product-draft-new';
    localStorage.removeItem(draftKey);
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);

      // Transform colors to string array for API (save color name, not hex value)
      const transformedData = {
        ...data,
        colors: data.colors.map(color =>
          typeof color === 'string' ? color : color.name
        )
      };

      if (isEditMode && id) {
        await api.updateProduct(id, transformedData);
      } else {
        await api.createProduct(transformedData);
      }

      // Clear draft after successful save
      clearDraft();
      setHasUnsavedChanges(false);

      toast({
        title: t.success,
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      navigate('/admin/products');
    }
  };

  const handleExitConfirm = () => {
    clearDraft();
    setShowExitDialog(false);
    navigate('/admin/products');
  };

  const handleFormChange = (newData: ProductFormData) => {
    setFormData(newData);
    setHasUnsavedChanges(true);
  };

  // Load draft on component mount for create mode
  useEffect(() => {
    if (!isEditMode && formData && !hasUnsavedChanges) {
      loadDraft();
    }
  }, [isEditMode, formData, hasUnsavedChanges, loadDraft]);

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

  if (!isAuthenticated || !isAdminUser(user)) {
    return null;
  }

  if (!formData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">{t.errorLoadingDesc}</p>
            <Button onClick={() => navigate('/admin/products')} className="mt-4">
              {t.back}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
              <p className="text-muted-foreground">
                {isEditMode
                  ? (language === 'vi' ? 'Chỉnh sửa thông tin sản phẩm' :
                    language === 'ja' ? '商品情報を編集' :
                      'Edit product information')
                  : (language === 'vi' ? 'Tạo sản phẩm mới cho cửa hàng' :
                    language === 'ja' ? '新しい商品を作成' :
                      'Create a new product for your store')
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-save indicator */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isDraftSaved ? (
                  <>
                    <Save className="h-4 w-4 text-green-500" />
                    <span>{t.saved}</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                    <span>{t.saving}</span>
                  </>
                )}
              </div>
            )}

            {/* Manual save draft button */}
            <Button
              variant="outline"
              size="sm"
              onClick={saveDraft}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              {language === 'vi' ? 'Lưu nháp' :
                language === 'ja' ? '下書き保存' :
                  'Save Draft'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-7xl mx-auto">
          <ProductForm
            initialData={formData}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            mode={mode}
            onFormChange={handleFormChange}
          />
        </div>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {t.unsavedChanges}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.unsavedChangesDesc}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowExitDialog(false)}>
                {t.stay}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleExitConfirm}
                className="bg-destructive hover:bg-destructive/90"
              >
                {t.leave}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
