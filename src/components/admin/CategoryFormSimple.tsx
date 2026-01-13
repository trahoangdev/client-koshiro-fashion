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
  description: string;
  slug: string;
  parentId: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  displayType: 'grid' | 'list' | 'carousel';
  color: string;
  cloudinaryImages: CloudinaryImage[];
  cloudinaryBannerImages: CloudinaryImage[];
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData> & { _id?: string };
  categories: Category[];
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

export default function CategoryFormSimple({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  mode
}: CategoryFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    slug: initialData?.slug || '',
    parentId: initialData?.parentId || '',
    status: initialData?.status || 'active',
    sortOrder: initialData?.sortOrder || 0,
    isFeatured: initialData?.isFeatured || false,
    isVisible: initialData?.isVisible !== false,
    displayType: initialData?.displayType || 'grid',
    color: initialData?.color || '#3B82F6',
    cloudinaryImages: initialData?.cloudinaryImages || [],
    cloudinaryBannerImages: initialData?.cloudinaryBannerImages || []
  });

  // Track if slug was manually edited
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên danh mục là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Lỗi", 
        description: "Slug là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clean up the data before submitting
      const cleanData = {
        ...formData,
        parentId: formData.parentId && formData.parentId !== "" ? formData.parentId : undefined
      };
      
      await onSubmit(cleanData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCloudinaryImagesUploaded = (images: CloudinaryImage[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryImages: [...prev.cloudinaryImages, ...images]
    }));
  };

  const handleCloudinaryImagesRemoved = (publicIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryImages: prev.cloudinaryImages.filter(img => !publicIds.includes(img.publicId))
    }));
  };

  const handleCloudinaryBannerImagesUploaded = (images: CloudinaryImage[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryBannerImages: [...prev.cloudinaryBannerImages, ...images]
    }));
  };

  const handleCloudinaryBannerImagesRemoved = (publicIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryBannerImages: prev.cloudinaryBannerImages.filter(img => !publicIds.includes(img.publicId))
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}
        </h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục *</Label>
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
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setFormData(prev => ({ ...prev, slug: e.target.value }));
                  }}
                  placeholder="ten-danh-muc"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả danh mục"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Danh mục cha</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có danh mục cha</SelectItem>
                  {categories.filter(cat => cat._id !== initialData?._id).map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 2. Cài đặt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Cài đặt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label htmlFor="isFeatured">Nổi bật</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                />
                <Label htmlFor="isVisible">Hiển thị</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayType">Kiểu hiển thị</Label>
              <Select
                value={formData.displayType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, displayType: value as 'grid' | 'list' | 'carousel' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Lưới</SelectItem>
                  <SelectItem value="list">Danh sách</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 3. Hình ảnh danh mục */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Hình ảnh danh mục
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Images */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hình ảnh danh mục</Label>
                <p className="text-sm text-muted-foreground">
                  Upload hình ảnh chính cho danh mục (tối đa 5 hình)
                </p>
              </div>
              <CloudinaryImageUpload
                onImagesUploaded={handleCloudinaryImagesUploaded}
                onImagesRemoved={handleCloudinaryImagesRemoved}
                existingImages={formData.cloudinaryImages}
                maxFiles={5}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
              />
            </div>

            <Separator />

            {/* Banner Images */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hình ảnh banner</Label>
                <p className="text-sm text-muted-foreground">
                  Upload hình ảnh banner cho danh mục (tối đa 3 hình)
                </p>
              </div>
              <CloudinaryImageUpload
                onImagesUploaded={handleCloudinaryBannerImagesUploaded}
                onImagesRemoved={handleCloudinaryBannerImagesRemoved}
                existingImages={formData.cloudinaryBannerImages}
                maxFiles={3}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
