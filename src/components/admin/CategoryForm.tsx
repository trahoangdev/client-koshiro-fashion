import { useState } from "react";
import { 
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Folder,
  Eye,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Category } from "@/lib/api";
import CloudinaryImageUpload from './CloudinaryImageUpload';

interface CloudinaryImage {
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
}

export interface CategoryFormData {
  name: string;
  nameEn: string;
  nameJa: string;
  description: string;
  descriptionEn: string;
  descriptionJa: string;
  slug: string;
  parentId: string;
  image: string; // Legacy field for backward compatibility
  cloudinaryImages: CloudinaryImage[]; // New Cloudinary images
  bannerImage: string; // Legacy field for backward compatibility
  cloudinaryBannerImages: CloudinaryImage[]; // New Cloudinary banner images
  status: 'active' | 'inactive';
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  displayType: 'grid' | 'list' | 'carousel';
  color: string;
  icon: string;
  seoUrl: string;
  canonicalUrl: string;
  schemaMarkup: string;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData> & { _id?: string };
  categories: Category[];
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

export default function CategoryForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  mode
}: CategoryFormProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    nameEn: '',
    nameJa: '',
    description: '',
    descriptionEn: '',
    descriptionJa: '',
    slug: '',
    parentId: '',
    image: '', // Legacy field
    cloudinaryImages: [], // New Cloudinary images
    bannerImage: '', // Legacy field
    cloudinaryBannerImages: [], // New Cloudinary banner images
    status: 'active',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    sortOrder: 0,
    isFeatured: false,
    isVisible: true,
    displayType: 'grid',
    color: '#3B82F6',
    icon: '',
    seoUrl: '',
    canonicalUrl: '',
    schemaMarkup: '',
    ...initialData
  });

  // Track if slug was manually edited
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const translations = {
    en: {
      title: mode === 'create' ? 'Create New Category' : 'Edit Category',
      name: 'Category Name',
      nameEn: 'Name (English)',
      nameJa: 'Name (Japanese)',
      description: 'Description',
      descriptionEn: 'Description (English)',
      descriptionJa: 'Description (Japanese)',
      slug: 'Slug',
      parentCategory: 'Parent Category',
      noParent: 'No parent category',
      image: 'Category Image',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      sortOrder: 'Sort Order',
      isFeatured: 'Featured Category',
      uploadImage: 'Upload Image',
      dragDrop: 'Drag and drop image here, or click to select',
      basicInfo: 'Basic Information',
      seo: 'SEO',
      settings: 'Settings',
      save: 'Save Category',
      cancel: 'Cancel',
      loading: 'Saving...',
      error: 'Error',
      success: 'Category saved successfully'
    },
    vi: {
      title: mode === 'create' ? 'Tạo Danh Mục Mới' : 'Chỉnh Sửa Danh Mục',
      name: 'Tên Danh Mục',
      nameEn: 'Tên (Tiếng Anh)',
      nameJa: 'Tên (Tiếng Nhật)',
      description: 'Mô Tả',
      descriptionEn: 'Mô Tả (Tiếng Anh)',
      descriptionJa: 'Mô Tả (Tiếng Nhật)',
      slug: 'Slug',
      parentCategory: 'Danh Mục Cha',
      noParent: 'Không có danh mục cha',
      image: 'Hình Ảnh Danh Mục',
      status: 'Trạng Thái',
      active: 'Hoạt Động',
      inactive: 'Không Hoạt Động',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      sortOrder: 'Thứ Tự Sắp Xếp',
      isFeatured: 'Danh Mục Nổi Bật',
      uploadImage: 'Tải Lên Hình Ảnh',
      dragDrop: 'Kéo và thả hình ảnh vào đây, hoặc click để chọn',
      basicInfo: 'Thông Tin Cơ Bản',
      seo: 'SEO',
      settings: 'Cài Đặt',
      save: 'Lưu Danh Mục',
      cancel: 'Hủy',
      loading: 'Đang lưu...',
      error: 'Lỗi',
      success: 'Danh mục đã được lưu thành công'
    },
    ja: {
      title: mode === 'create' ? '新しいカテゴリを作成' : 'カテゴリを編集',
      name: 'カテゴリ名',
      nameEn: '名前（英語）',
      nameJa: '名前（日本語）',
      description: '説明',
      descriptionEn: '説明（英語）',
      descriptionJa: '説明（日本語）',
      slug: 'スラッグ',
      parentCategory: '親カテゴリ',
      noParent: '親カテゴリなし',
      image: 'カテゴリ画像',
      status: 'ステータス',
      active: 'アクティブ',
      inactive: '非アクティブ',
      metaTitle: 'メタタイトル',
      metaDescription: 'メタ説明',
      sortOrder: '並び順',
      isFeatured: 'おすすめカテゴリ',
      uploadImage: '画像をアップロード',
      dragDrop: 'ここに画像をドラッグ＆ドロップ、またはクリックして選択',
      basicInfo: '基本情報',
      seo: 'SEO',
      settings: '設定',
      save: 'カテゴリを保存',
      cancel: 'キャンセル',
      loading: '保存中...',
      error: 'エラー',
      success: 'カテゴリが正常に保存されました'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        parentId: formData.parentId === "none" ? "" : formData.parentId
      };
      await onSubmit(submitData);
      toast({
        title: t.success,
      });
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server and get URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    }
  };

  // Cloudinary image handlers
  const handleCloudinaryImagesUploaded = (newImages: CloudinaryImage[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryImages: [...prev.cloudinaryImages, ...newImages]
    }));
  };

  const handleCloudinaryImagesRemoved = (publicIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryImages: prev.cloudinaryImages.filter(img => !publicIds.includes(img.publicId))
    }));
  };

  const handleCloudinaryBannerImagesUploaded = (newImages: CloudinaryImage[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryBannerImages: [...prev.cloudinaryBannerImages, ...newImages]
    }));
  };

  const handleCloudinaryBannerImagesRemoved = (publicIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryBannerImages: prev.cloudinaryBannerImages.filter(img => !publicIds.includes(img.publicId))
    }));
  };

  const generateSlug = (name: string) => {
    if (!name || !name.trim()) {
      return '';
    }
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese diacritics
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .trim();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t.save}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              {t.basicInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  // Auto-generate slug only if it wasn't manually edited or if we're creating new
                  const newSlug = mode === 'create' || !isSlugManuallyEdited 
                    ? generateSlug(name) 
                    : formData.slug;
                  setFormData(prev => ({ 
                    ...prev, 
                    name,
                    slug: newSlug
                  }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t.nameEn}</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameJa">{t.nameJa}</Label>
              <Input
                id="nameJa"
                value={formData.nameJa}
                onChange={(e) => setFormData(prev => ({ ...prev, nameJa: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t.slug}</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  setIsSlugManuallyEdited(true);
                  setFormData(prev => ({ ...prev, slug: e.target.value }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentCategory">{t.parentCategory}</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.noParent} />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="none">{t.noParent}</SelectItem>
                   {categories
                     .filter(cat => cat._id !== initialData?._id) // Exclude current category from parent options
                     .map(category => (
                       <SelectItem key={category._id} value={category._id}>
                         {category.name}
                       </SelectItem>
                     ))}
                 </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{t.descriptionEn}</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionJa">{t.descriptionJa}</Label>
              <Textarea
                id="descriptionJa"
                value={formData.descriptionJa}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionJa: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings & SEO */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t.settings}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">{t.status}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">{t.sortOrder}</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isFeatured}</Label>
                  <p className="text-sm text-muted-foreground">Show on homepage and featured sections</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t.seo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">{t.metaTitle}</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                />
              </div>
                          <div className="space-y-2">
              <Label htmlFor="metaDescription">{t.metaDescription}</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={formData.metaKeywords}
                onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayType">Display Type</Label>
              <Select
                value={formData.displayType}
                onValueChange={(value: 'grid' | 'list' | 'carousel') => setFormData(prev => ({ ...prev, displayType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="icon-name"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Visible</Label>
                <p className="text-sm text-muted-foreground">Show this category to customers</p>
              </div>
              <Switch
                checked={formData.isVisible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
              />
            </div>
          </CardContent>
        </Card>

          {/* Banner Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Banner Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.bannerImage && (
                <div className="relative">
                  <img
                    src={formData.bannerImage}
                    alt="Banner"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, bannerImage: '' }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">Drag and drop banner image here, or click to select</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('banner-image-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Banner Image
                </Button>
                <input
                  id="banner-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);
                      setFormData(prev => ({ ...prev, bannerImage: imageUrl }));
                    }
                  }}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO URLs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                SEO URLs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoUrl">SEO URL</Label>
                <Input
                  id="seoUrl"
                  value={formData.seoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoUrl: e.target.value }))}
                  placeholder="https://example.com/category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                  placeholder="https://example.com/category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schemaMarkup">Schema Markup</Label>
                <Textarea
                  id="schemaMarkup"
                  value={formData.schemaMarkup}
                  onChange={(e) => setFormData(prev => ({ ...prev, schemaMarkup: e.target.value }))}
                  rows={4}
                  placeholder='{"@type": "Category", "name": "Category Name"}'
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {t.image}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CloudinaryImageUpload
                onImagesUploaded={handleCloudinaryImagesUploaded}
                onImagesRemoved={handleCloudinaryImagesRemoved}
                existingImages={formData.cloudinaryImages}
                maxFiles={5}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
              />
            </CardContent>
          </Card>

          {/* Banner Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Banner Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CloudinaryImageUpload
                onImagesUploaded={handleCloudinaryBannerImagesUploaded}
                onImagesRemoved={handleCloudinaryBannerImagesRemoved}
                existingImages={formData.cloudinaryBannerImages}
                maxFiles={3}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
} 