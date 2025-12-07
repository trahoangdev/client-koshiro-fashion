import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Package,
  DollarSign,
  Palette,
  Ruler,
  Star,
  Eye,
  Tag,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@/styles/markdown-editor.css';
import CloudinaryImageUpload from './CloudinaryImageUpload';
import CloudinaryVideoUpload from './CloudinaryVideoUpload';

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

interface CloudinaryVideo {
  publicId: string;
  secureUrl: string;
  duration?: number;
  format: string;
  bytes: number;
}

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
  images: string[]; // Legacy field for backward compatibility
  cloudinaryImages: CloudinaryImage[]; // New Cloudinary images
  galleryImages: CloudinaryImage[]; // Additional gallery images for product detail page
  videos: CloudinaryVideo[]; // Video support
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
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  sku: string;
  barcode: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onFormChange?: (data: ProductFormData) => void;
}

const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const defaultColors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Purple', value: '#800080' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Brown', value: '#A52A2A' }
];

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  mode,
  onFormChange
}: ProductFormProps) {
  const { toast } = useToast();
  const { language } = useLanguage();

  // Function to get hex value from color name
  const getColorHex = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      // Vietnamese colors
      'Đen': '#000000',
      'Trắng': '#FFFFFF',
      'Đỏ': '#FF0000',
      'Xanh dương': '#0000FF',
      'Xanh lá': '#008000',
      'Vàng': '#FFFF00',
      'Hồng': '#FFC0CB',
      'Tím': '#800080',
      'Cam': '#FFA500',
      'Nâu': '#A52A2A',
      'Xám': '#808080',
      'Bạc': '#C0C0C0',
      'Vàng kim': '#FFD700',
      'Xanh ngọc': '#40E0D0',
      
      // English colors
      'Black': '#000000',
      'White': '#FFFFFF',
      'Red': '#FF0000',
      'Blue': '#0000FF',
      'Green': '#008000',
      'Yellow': '#FFFF00',
      'Pink': '#FFC0CB',
      'Purple': '#800080',
      'Orange': '#FFA500',
      'Brown': '#A52A2A',
      'Gray': '#808080',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Turquoise': '#40E0D0',
      
      // Japanese colors
      '黒': '#000000',
      '白': '#FFFFFF',
      '赤': '#FF0000',
      '青': '#0000FF',
      '緑': '#008000',
      '黄': '#FFFF00',
      'ピンク': '#FFC0CB',
      '紫': '#800080',
      'オレンジ': '#FFA500',
      '茶色': '#A52A2A',
      'グレー': '#808080',
      'シルバー': '#C0C0C0',
      'ゴールド': '#FFD700',
      'ターコイズ': '#40E0D0'
    };
    
    return colorMap[colorName] || '#6b7280';
  };

  // Helper function to convert string colors to color objects
  const convertColorsToObjects = useCallback((colors: string[]): Array<string | { name: string; value: string }> => {
    return colors.map(color => {
      // Check if it's already an object
      if (typeof color === 'object') {
        return color;
      }
      
      // Find matching default color
      const defaultColor = defaultColors.find(dc => dc.name === color);
      if (defaultColor) {
        return defaultColor;
      }
      
      // For custom colors, try to get hex value from color name
      const hexValue = getColorHex(color);
      return { name: color, value: hexValue };
    });
  }, []);

  const [formData, setFormData] = useState<ProductFormData>(() => {
    const baseData = {
      name: '',
      nameEn: '',
      nameJa: '',
      description: '',
      descriptionEn: '',
      descriptionJa: '',
      price: 0,
      originalPrice: 0,
      categoryId: '',
      images: [], // Legacy field
      cloudinaryImages: [], // New Cloudinary images
      galleryImages: [], // Additional gallery images for product detail page
      videos: [], // Video support
      sizes: [],
      colors: [],
      stock: 0,
      tags: [],
      isActive: true,
      isFeatured: false,
      onSale: false,
      isNew: mode === 'create', // New products are automatically new
      isLimitedEdition: false,
      isBestSeller: false,
      metaTitle: '',
      metaDescription: '',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0
      },
      sku: '',
      barcode: ''
    };

    if (initialData) {
      return {
        ...baseData,
        ...initialData,
        // Convert colors from string[] to objects if needed
        colors: initialData.colors ? convertColorsToObjects(initialData.colors as string[]) : []
      };
    }

    return baseData;
  });

  const [newTag, setNewTag] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  
  // Refs to prevent unnecessary re-renders
  const cloudinaryImagesRef = useRef<CloudinaryImage[]>([]);
  const videosRef = useRef<CloudinaryVideo[]>([]);
  const galleryImagesRef = useRef<CloudinaryImage[]>([]);

  // Auto-detect badge statuses from tags
  const detectBadgeFromTags = (tags: string[]) => {
    const isLimitedEdition = tags.some(tag => 
      /limited|giới hạn|限定|limited edition|phiên bản giới hạn|限定版/i.test(tag)
    );
    const isBestSeller = tags.some(tag => 
      /bestseller|bán chạy|ベストセラー|best seller|top seller|bán nhiều|人気/i.test(tag)
    );
    
    return { isLimitedEdition, isBestSeller };
  };

  // Helper function to validate form data
  const validateFormData = (data: ProductFormData): string[] => {
    const errors: string[] = [];
    
    if (!data.name.trim()) {
      errors.push(language === 'vi' ? 'Tên sản phẩm là bắt buộc' : 
                 language === 'ja' ? '商品名は必須です' : 
                 'Product name is required');
    }
    
    if (!data.categoryId) {
      errors.push(language === 'vi' ? 'Danh mục là bắt buộc' : 
                 language === 'ja' ? 'カテゴリは必須です' : 
                 'Category is required');
    }
    
    if (data.price <= 0) {
      errors.push(language === 'vi' ? 'Giá phải lớn hơn 0' : 
                 language === 'ja' ? '価格は0より大きくなければなりません' : 
                 'Price must be greater than 0');
    }
    
    if (data.stock < 0) {
      errors.push(language === 'vi' ? 'Số lượng tồn kho không được âm' : 
                 language === 'ja' ? '在庫数量は負の値にできません' : 
                 'Stock quantity cannot be negative');
    }
    
    if (data.weight < 0) {
      errors.push(language === 'vi' ? 'Trọng lượng không được âm' : 
                 language === 'ja' ? '重量は負の値にできません' : 
                 'Weight cannot be negative');
    }
    
    if (data.dimensions.length < 0 || data.dimensions.width < 0 || data.dimensions.height < 0) {
      errors.push(language === 'vi' ? 'Kích thước không được âm' : 
                 language === 'ja' ? 'サイズは負の値にできません' : 
                 'Dimensions cannot be negative');
    }
    
    return errors;
  };

  // Update formData when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        colors: initialData.colors ? convertColorsToObjects(initialData.colors as string[]) : prev.colors,
        videos: initialData.videos || []
      }));
    }
  }, [initialData, convertColorsToObjects]);

  // Call onFormChange callback when form data changes
  useEffect(() => {
    if (onFormChange && formData) {
      onFormChange(formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]); // Remove onFormChange from dependencies to prevent infinite loops

  // Sync refs with formData to prevent unnecessary re-renders
  useEffect(() => {
    cloudinaryImagesRef.current = formData.cloudinaryImages;
    videosRef.current = formData.videos;
    galleryImagesRef.current = formData.galleryImages;
  }, [formData.cloudinaryImages, formData.videos, formData.galleryImages]);

  const translations = useMemo(() => ({
    en: {
      title: mode === 'create' ? 'Create New Product' : 'Edit Product',
      name: 'Product Name',
      nameEn: 'Name (English)',
      nameJa: 'Name (Japanese)',
      description: 'Description',
      descriptionEn: 'Description (English)',
      descriptionJa: 'Description (Japanese)',
      price: 'Price',
      originalPrice: 'Original Price',
      category: 'Category',
      images: 'Product Images',
      sizes: 'Available Sizes',
      colors: 'Available Colors',
      stock: 'Stock Quantity',
      tags: 'Tags',
      isActive: 'Active',
      isFeatured: 'Featured',
      onSale: 'On Sale',
      isNew: 'New Product',
      isLimitedEdition: 'Limited Edition',
      isBestSeller: 'Best Seller',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      weight: 'Weight (kg)',
      dimensions: 'Dimensions (cm)',
      length: 'Length',
      width: 'Width',
      height: 'Height',
      sku: 'SKU',
      barcode: 'Barcode',
      addTag: 'Add Tag',
      addSize: 'Add Size',
      addColor: 'Add Color',
      colorName: 'Color Name',
      colorValue: 'Color Value',
      uploadImage: 'Upload Image',
      dragDrop: 'Drag and drop images here, or click to select',
      basicInfo: 'Basic Information',
      pricing: 'Pricing',
      inventory: 'Inventory',
      media: 'Media',
      seo: 'SEO',
      shipping: 'Shipping',
      save: 'Save Product',
      cancel: 'Cancel',
      loading: 'Saving...',
      error: 'Error',
      success: 'Product saved successfully'
    },
    vi: {
      title: mode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Chỉnh Sửa Sản Phẩm',
      name: 'Tên Sản Phẩm',
      nameEn: 'Tên (Tiếng Anh)',
      nameJa: 'Tên (Tiếng Nhật)',
      description: 'Mô Tả',
      descriptionEn: 'Mô Tả (Tiếng Anh)',
      descriptionJa: 'Mô Tả (Tiếng Nhật)',
      price: 'Giá',
      originalPrice: 'Giá Gốc',
      category: 'Danh Mục',
      images: 'Hình Ảnh Sản Phẩm',
      sizes: 'Kích Thước Có Sẵn',
      colors: 'Màu Sắc Có Sẵn',
      stock: 'Số Lượng Tồn Kho',
      tags: 'Thẻ',
      isActive: 'Hoạt Động',
      isFeatured: 'Nổi Bật',
      onSale: 'Đang Giảm Giá',
      isNew: 'Sản Phẩm Mới',
      isLimitedEdition: 'Phiên Bản Giới Hạn',
      isBestSeller: 'Bán Chạy',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      weight: 'Trọng Lượng (kg)',
      dimensions: 'Kích Thước (cm)',
      length: 'Chiều Dài',
      width: 'Chiều Rộng',
      height: 'Chiều Cao',
      sku: 'SKU',
      barcode: 'Mã Vạch',
      addTag: 'Thêm Thẻ',
      addSize: 'Thêm Kích Thước',
      addColor: 'Thêm Màu',
      colorName: 'Tên Màu',
      colorValue: 'Giá Trị Màu',
      uploadImage: 'Tải Lên Hình Ảnh',
      dragDrop: 'Kéo và thả hình ảnh vào đây, hoặc click để chọn',
      basicInfo: 'Thông Tin Cơ Bản',
      pricing: 'Định Giá',
      inventory: 'Tồn Kho',
      media: 'Phương Tiện',
      seo: 'SEO',
      shipping: 'Vận Chuyển',
      save: 'Lưu Sản Phẩm',
      cancel: 'Hủy',
      loading: 'Đang lưu...',
      error: 'Lỗi',
      success: 'Sản phẩm đã được lưu thành công'
    },
    ja: {
      title: mode === 'create' ? '新しい商品を作成' : '商品を編集',
      name: '商品名',
      nameEn: '名前（英語）',
      nameJa: '名前（日本語）',
      description: '説明',
      descriptionEn: '説明（英語）',
      descriptionJa: '説明（日本語）',
      price: '価格',
      originalPrice: '原価',
      category: 'カテゴリ',
      images: '商品画像',
      sizes: '利用可能なサイズ',
      colors: '利用可能な色',
      stock: '在庫数量',
      tags: 'タグ',
      isActive: 'アクティブ',
      isFeatured: 'おすすめ',
      onSale: 'セール中',
      isNew: '新商品',
      isLimitedEdition: '限定版',
      isBestSeller: 'ベストセラー',
      metaTitle: 'メタタイトル',
      metaDescription: 'メタ説明',
      weight: '重量（kg）',
      dimensions: 'サイズ（cm）',
      length: '長さ',
      width: '幅',
      height: '高さ',
      sku: 'SKU',
      barcode: 'バーコード',
      addTag: 'タグを追加',
      addSize: 'サイズを追加',
      addColor: '色を追加',
      colorName: '色名',
      colorValue: '色の値',
      uploadImage: '画像をアップロード',
      dragDrop: 'ここに画像をドラッグ＆ドロップ、またはクリックして選択',
      basicInfo: '基本情報',
      pricing: '価格設定',
      inventory: '在庫',
      media: 'メディア',
      seo: 'SEO',
      shipping: '配送',
      save: '商品を保存',
      cancel: 'キャンセル',
      loading: '保存中...',
      error: 'エラー',
      success: '商品が正常に保存されました'
    }
  }), [mode]);

  const t = useMemo(() => 
    translations[language as keyof typeof translations] || translations.en, 
    [language, translations]
  );

  // Function to get color name from hex value
  const getColorName = (hex: string): string => {
    const colorMap: { [key: string]: string } = {
      '#000000': language === 'vi' ? 'Đen' : language === 'ja' ? '黒' : 'Black',
      '#FFFFFF': language === 'vi' ? 'Trắng' : language === 'ja' ? '白' : 'White',
      '#FF0000': language === 'vi' ? 'Đỏ' : language === 'ja' ? '赤' : 'Red',
      '#0000FF': language === 'vi' ? 'Xanh dương' : language === 'ja' ? '青' : 'Blue',
      '#008000': language === 'vi' ? 'Xanh lá' : language === 'ja' ? '緑' : 'Green',
      '#FFFF00': language === 'vi' ? 'Vàng' : language === 'ja' ? '黄' : 'Yellow',
      '#800080': language === 'vi' ? 'Tím' : language === 'ja' ? '紫' : 'Purple',
      '#FFA500': language === 'vi' ? 'Cam' : language === 'ja' ? 'オレンジ' : 'Orange',
      '#FFC0CB': language === 'vi' ? 'Hồng' : language === 'ja' ? 'ピンク' : 'Pink',
      '#A52A2A': language === 'vi' ? 'Nâu' : language === 'ja' ? '茶色' : 'Brown',
      '#808080': language === 'vi' ? 'Xám' : language === 'ja' ? 'グレー' : 'Gray',
      '#FFD700': language === 'vi' ? 'Vàng kim' : language === 'ja' ? '金色' : 'Gold',
      '#C0C0C0': language === 'vi' ? 'Bạc' : language === 'ja' ? '銀色' : 'Silver',
      '#FF6347': language === 'vi' ? 'Đỏ cam' : language === 'ja' ? 'トマト' : 'Tomato',
      '#32CD32': language === 'vi' ? 'Xanh lá sáng' : language === 'ja' ? 'ライム' : 'Lime Green',
      '#00CED1': language === 'vi' ? 'Xanh ngọc' : language === 'ja' ? 'ターコイズ' : 'Turquoise',
      '#40E0D0': language === 'vi' ? 'Xanh ngọc' : language === 'ja' ? 'ターコイズ' : 'Turquoise',
      '#FF1493': language === 'vi' ? 'Hồng đậm' : language === 'ja' ? 'ディープピンク' : 'Deep Pink',
      '#8B4513': language === 'vi' ? 'Nâu sẫm' : language === 'ja' ? 'サドルブラウン' : 'Saddle Brown',
      '#2F4F4F': language === 'vi' ? 'Xám đậm' : language === 'ja' ? 'ダークスレートグレー' : 'Dark Slate Gray',
      '#DC143C': language === 'vi' ? 'Đỏ thẫm' : language === 'ja' ? 'クリムゾン' : 'Crimson'
    };

    // Check exact match first
    if (colorMap[hex.toUpperCase()]) {
      return colorMap[hex.toUpperCase()];
    }

    // Try to find closest match for similar colors
    const hexUpper = hex.toUpperCase();
    for (const [colorHex, colorName] of Object.entries(colorMap)) {
      if (hexUpper.includes(colorHex.substring(1, 4)) || 
          colorHex.includes(hexUpper.substring(1, 4))) {
        return colorName;
      }
    }

    // If no match found, return the hex value
    return hex;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      toast({
        title: t.error,
        description: validationErrors.join(', '),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Transform colors to string array for backend
      const transformedData = {
        ...formData,
        colors: formData.colors.map(color => 
          typeof color === 'string' ? color : color.name
        )
      };
      
      await onSubmit(transformedData);
      toast({
        title: t.success,
      });
    } catch (error) {
      console.error('ProductForm submit error:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      const updatedTags = [...formData.tags, trimmedTag];
      const badgeStatus = detectBadgeFromTags(updatedTags);
      
      setFormData(prev => ({
        ...prev,
        tags: updatedTags,
        isLimitedEdition: badgeStatus.isLimitedEdition,
        isBestSeller: badgeStatus.isBestSeller
      }));
      setNewTag('');
      
      toast({
        title: language === 'vi' ? 'Thêm tag thành công' : 
               language === 'ja' ? 'タグを追加しました' : 
               'Tag added successfully',
        description: language === 'vi' ? `Đã thêm tag "${trimmedTag}"` :
                     language === 'ja' ? `タグ"${trimmedTag}"を追加しました` :
                     `Added tag "${trimmedTag}"`,
      });
    } else if (trimmedTag && formData.tags.includes(trimmedTag)) {
      toast({
        title: language === 'vi' ? 'Tag đã tồn tại' : 
               language === 'ja' ? 'タグが既に存在します' : 
               'Tag already exists',
        description: language === 'vi' ? 'Tag này đã được thêm vào danh sách' :
                     language === 'ja' ? 'このタグは既にリストに追加されています' :
                     'This tag has already been added to the list',
        variant: 'destructive',
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    const badgeStatus = detectBadgeFromTags(updatedTags);
    
    setFormData(prev => ({
      ...prev,
      tags: updatedTags,
      isLimitedEdition: badgeStatus.isLimitedEdition,
      isBestSeller: badgeStatus.isBestSeller
    }));
  };

  const addSize = () => {
    const trimmedSize = newSize.trim();
    if (trimmedSize && !formData.sizes.includes(trimmedSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, trimmedSize]
      }));
      setNewSize('');
      
      toast({
        title: language === 'vi' ? 'Thêm kích thước thành công' : 
               language === 'ja' ? 'サイズを追加しました' : 
               'Size added successfully',
        description: language === 'vi' ? `Đã thêm kích thước "${trimmedSize}"` :
                     language === 'ja' ? `サイズ"${trimmedSize}"を追加しました` :
                     `Added size "${trimmedSize}"`,
      });
    } else if (trimmedSize && formData.sizes.includes(trimmedSize)) {
      toast({
        title: language === 'vi' ? 'Kích thước đã tồn tại' : 
               language === 'ja' ? 'サイズが既に存在します' : 
               'Size already exists',
        description: language === 'vi' ? 'Kích thước này đã được thêm vào danh sách' :
                     language === 'ja' ? 'このサイズは既にリストに追加されています' :
                     'This size has already been added to the list',
        variant: 'destructive',
      });
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }));
  };

  const addColor = () => {
    // Validate hex color format
    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(newColor) || /^#[0-9A-Fa-f]{3}$/.test(newColor);
    const colorName = newColorName.trim() || getColorName(newColor);
    
    if (colorName && newColor.trim() && isValidHex) {
      const colorExists = formData.colors.some(color => 
        typeof color === 'string' ? color === colorName : color.name === colorName
      );
      
      if (!colorExists) {
        setFormData(prev => ({
          ...prev,
          colors: [...prev.colors, { name: colorName, value: newColor.trim() }]
        }));
        setNewColorName('');
        setNewColor('#000000'); // Reset to default color
        setDisplayValue('');
        toast({
          title: language === 'vi' ? 'Thêm màu thành công' : 
                 language === 'ja' ? '色を追加しました' : 
                 'Color added successfully',
          description: language === 'vi' ? `Đã thêm màu ${colorName}` :
                       language === 'ja' ? `${colorName}色を追加しました` :
                       `Added color ${colorName}`,
        });
      } else {
        toast({
          title: language === 'vi' ? 'Màu đã tồn tại' : 
                 language === 'ja' ? '色が既に存在します' : 
                 'Color already exists',
          description: language === 'vi' ? 'Màu này đã được thêm vào danh sách' :
                       language === 'ja' ? 'この色は既にリストに追加されています' :
                       'This color has already been added to the list',
          variant: 'destructive',
        });
      }
    } else {
      let errorMessage = '';
      if (!colorName) {
        errorMessage = language === 'vi' ? 'Vui lòng nhập tên màu' :
                      language === 'ja' ? '色名を入力してください' :
                      'Please enter color name';
      } else if (!isValidHex) {
        errorMessage = language === 'vi' ? 'Mã màu hex không hợp lệ (ví dụ: #FF0000)' :
                      language === 'ja' ? '無効な16進数カラーコードです（例：#FF0000）' :
                      'Invalid hex color code (e.g., #FF0000)';
      }
      
      toast({
        title: language === 'vi' ? 'Thiếu thông tin' : 
               language === 'ja' ? '情報が不足しています' : 
               'Missing information',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const removeColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => 
        typeof color === 'string' ? color !== colorToRemove : color.name !== colorToRemove
      )
    }));
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload to a server and get URLs
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  // Cloudinary image handlers - memoized to prevent re-renders
  const handleCloudinaryImagesUploaded = useCallback((newImages: CloudinaryImage[]) => {
    setFormData(prev => {
      const updatedImages = [...prev.cloudinaryImages, ...newImages];
      cloudinaryImagesRef.current = updatedImages;
      return {
        ...prev,
        cloudinaryImages: updatedImages
      };
    });
  }, []);

  const handleCloudinaryImagesRemoved = useCallback((publicIds: string[]) => {
    setFormData(prev => {
      const updatedImages = prev.cloudinaryImages.filter(img => !publicIds.includes(img.publicId));
      cloudinaryImagesRef.current = updatedImages;
      return {
        ...prev,
        cloudinaryImages: updatedImages
      };
    });
  }, []);

  // Cloudinary video handlers - memoized to prevent re-renders
  const handleCloudinaryVideosUploaded = useCallback((newVideos: CloudinaryVideo[]) => {
    setFormData(prev => {
      const updatedVideos = [...prev.videos, ...newVideos];
      videosRef.current = updatedVideos;
      return {
        ...prev,
        videos: updatedVideos
      };
    });
  }, []);

  const handleCloudinaryVideosRemoved = useCallback((publicIds: string[]) => {
    setFormData(prev => {
      const updatedVideos = prev.videos.filter(video => !publicIds.includes(video.publicId));
      videosRef.current = updatedVideos;
      return {
        ...prev,
        videos: updatedVideos
      };
    });
  }, []);

  // Gallery image handlers - memoized to prevent re-renders
  const handleGalleryImagesUploaded = useCallback((newImages: CloudinaryImage[]) => {
    setFormData(prev => {
      const updatedImages = [...prev.galleryImages, ...newImages];
      galleryImagesRef.current = updatedImages;
      return {
        ...prev,
        galleryImages: updatedImages
      };
    });
    
    // Call callback after state update to prevent immediate re-render
    setTimeout(() => {
      // Additional processing if needed
    }, 0);
  }, []);

  const handleGalleryImagesRemoved = useCallback((publicIds: string[]) => {
    setFormData(prev => {
      const updatedImages = prev.galleryImages.filter(img => !publicIds.includes(img.publicId));
      galleryImagesRef.current = updatedImages;
      return {
        ...prev,
        galleryImages: updatedImages
      };
    });
    
    // Call callback after state update to prevent immediate re-render
    setTimeout(() => {
      // Additional processing if needed
    }, 0);
  }, []);

  // Memoize props to prevent unnecessary re-renders
  const cloudinaryImagesKey = useMemo(() => 
    `${formData.cloudinaryImages.length}-${formData.cloudinaryImages.map(img => img.publicId).join(',')}`, 
    [formData.cloudinaryImages]
  );
  
  const videosKey = useMemo(() => 
    `${formData.videos.length}-${formData.videos.map(video => video.publicId).join(',')}`, 
    [formData.videos]
  );
  
  const galleryImagesKey = useMemo(() => 
    `${formData.galleryImages.length}-${formData.galleryImages.map(img => img.publicId).join(',')}`, 
    [formData.galleryImages]
  );
  
  const memoizedCloudinaryImages = useMemo(() => {
    // Use ref if available, otherwise fallback to formData
    return cloudinaryImagesRef.current.length > 0 ? cloudinaryImagesRef.current : formData.cloudinaryImages;
  }, [formData.cloudinaryImages]);
  
  const memoizedVideos = useMemo(() => {
    // Use ref if available, otherwise fallback to formData
    return videosRef.current.length > 0 ? videosRef.current : formData.videos;
  }, [formData.videos]);

  const memoizedGalleryImages = useMemo(() => {
    // Use ref if available, otherwise fallback to formData
    return galleryImagesRef.current.length > 0 ? galleryImagesRef.current : formData.galleryImages;
  }, [formData.galleryImages]);

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
              <Package className="h-5 w-5" />
              {t.basicInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              <Label htmlFor="category">{t.category}</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <div className="border rounded-md overflow-hidden">
                <MDEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value || '' }))}
                  data-color-mode="light"
                  height={250}
                  preview="live"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Nhập mô tả sản phẩm bằng Markdown...\n\nVí dụ:\n**In đậm**\n*In nghiêng*\n# Tiêu đề\n- Danh sách\n1. Đánh số',
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{t.descriptionEn}</Label>
              <div className="border rounded-md overflow-hidden">
                <MDEditor
                  value={formData.descriptionEn}
                  onChange={(value) => setFormData(prev => ({ ...prev, descriptionEn: value || '' }))}
                  data-color-mode="light"
                  height={250}
                  preview="live"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Enter product description in Markdown...\n\nExample:\n**Bold text**\n*Italic text*\n# Heading\n- List item\n1. Numbered list',
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionJa">{t.descriptionJa}</Label>
              <div className="border rounded-md overflow-hidden">
                <MDEditor
                  value={formData.descriptionJa}
                  onChange={(value) => setFormData(prev => ({ ...prev, descriptionJa: value || '' }))}
                  data-color-mode="light"
                  height={250}
                  preview="live"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Markdownで商品説明を入力...\n\n例:\n**太字**\n*斜体*\n# 見出し\n- リスト\n1. 番号付きリスト',
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t.pricing}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t.price}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, price: isNaN(value) ? 0 : value }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">{t.originalPrice}</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, originalPrice: isNaN(value) ? 0 : value }));
                }}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isActive}</Label>
                  <p className="text-sm text-muted-foreground">Make product visible to customers</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.onSale}</Label>
                  <p className="text-sm text-muted-foreground">Mark as on sale</p>
                </div>
                <Switch
                  checked={formData.onSale}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, onSale: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isNew}</Label>
                  <p className="text-sm text-muted-foreground">Mark as new product</p>
                </div>
                <Switch
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNew: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isLimitedEdition}</Label>
                  <p className="text-sm text-muted-foreground">Mark as limited edition</p>
                </div>
                <Switch
                  checked={formData.isLimitedEdition}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLimitedEdition: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isBestSeller}</Label>
                  <p className="text-sm text-muted-foreground">Mark as best seller</p>
                </div>
                <Switch
                  checked={formData.isBestSeller}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBestSeller: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.inventory}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock">{t.stock}</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData(prev => ({ ...prev, stock: isNaN(value) ? 0 : value }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">{t.sku}</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">{t.barcode}</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.sizes}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {defaultSizes.map(size => (
                    <Badge
                      key={size}
                      variant={formData.sizes.includes(size) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.sizes.includes(size)) {
                          removeSize(size);
                        } else {
                          setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                        }
                      }}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom size"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addSize}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.colors}</Label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {/* Default colors */}
                    {defaultColors.map(color => (
                      <Badge
                        key={color.name}
                        variant={formData.colors.some(c => 
                          typeof c === 'string' ? c === color.name : c.name === color.name
                        ) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: color.value, color: color.value === '#FFFFFF' ? '#000' : '#fff' }}
                        onClick={() => {
                          const colorExists = formData.colors.some(c => 
                            typeof c === 'string' ? c === color.name : c.name === color.name
                          );
                          if (colorExists) {
                            removeColor(color.name);
                          } else {
                            setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
                            // Auto-fill color picker and name when selecting from default colors
                            setNewColor(color.value);
                            setNewColorName(color.name);
                            setDisplayValue(getColorName(color.value));
                          }
                        }}
                      >
                        {color.name}
                      </Badge>
                    ))}
                    
                    {/* Custom colors */}
                    {formData.colors
                      .filter(color => 
                        typeof color === 'object' && !defaultColors.some(dc => dc.name === color.name)
                      )
                      .map((color, index) => {
                        const colorObj = color as { name: string; value: string };
                        return (
                          <Badge
                            key={`custom-${index}`}
                            variant="secondary"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: colorObj.value, color: colorObj.value === '#FFFFFF' ? '#000' : '#fff' }}
                            onClick={() => {
                              removeColor(colorObj.name);
                            }}
                          >
                            {colorObj.name}
                          </Badge>
                        );
                      })}
                  </div>

                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                                            <Input
                          placeholder={language === 'vi' ? 'Tên màu' : 
                                     language === 'ja' ? '色名' : 
                                     'Color name'}
                          value={newColorName || getColorName(newColor)}
                          onChange={(e) => setNewColorName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                        />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={newColor}
                          onChange={(e) => {
                            setNewColor(e.target.value);
                            setDisplayValue(getColorName(e.target.value));
                            // Always auto-fill color name when color picker changes
                            setNewColorName(getColorName(e.target.value));
                          }}
                          className="w-12 h-10 p-1 border rounded cursor-pointer"
                          title={`${getColorName(newColor)} (${newColor})`}
                        />
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: newColor }}
                          title={`${getColorName(newColor)} (${newColor})`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={language === 'vi' ? 'Nhập mã hex (ví dụ: #FF0000)' : 
                                     language === 'ja' ? '16進数を入力（例：#FF0000）' : 
                                     'Enter hex code (e.g., #FF0000)'}
                          value={displayValue}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            
                            // If user is typing a hex code
                            if (inputValue.startsWith('#') || /^[0-9A-Fa-f]/.test(inputValue)) {
                              let hexValue = inputValue;
                              
                              // Auto-add # if user types without it
                              if (hexValue && !hexValue.startsWith('#')) {
                                hexValue = '#' + hexValue;
                              }
                              
                              // Validate hex color format (3 or 6 digits)
                              if (/^#[0-9A-Fa-f]{6}$/.test(hexValue) || /^#[0-9A-Fa-f]{3}$/.test(hexValue)) {
                                setNewColor(hexValue);
                                setDisplayValue(getColorName(hexValue));
                                // Always auto-fill color name when valid hex is entered
                                setNewColorName(getColorName(hexValue));
                              } else if (hexValue === '' || hexValue === '#') {
                                setNewColor('#000000');
                                setDisplayValue('');
                              } else {
                                // Allow partial input for better UX
                                setNewColor(hexValue);
                                setDisplayValue(hexValue);
                              }
                            } else {
                              // If user is typing a color name, search for matching hex
                              setDisplayValue(inputValue);
                              // You could add logic here to search for color names and match to hex values
                            }
                          }}
                          className="flex-1 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          {language === 'vi' ? 'Hex' : 
                           language === 'ja' ? '16進数' : 
                           'Hex'}
                        </span>
                      </div>
                      

                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={addColor} className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      {t.addColor}
                    </Button>
                    {(newColorName || newColor !== '#000000') && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setNewColorName('');
                          setNewColor('#000000');
                          setDisplayValue('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {t.media}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t.images}</Label>
              <CloudinaryImageUpload
                onImagesUploaded={handleCloudinaryImagesUploaded}
                onImagesRemoved={handleCloudinaryImagesRemoved}
                existingImages={memoizedCloudinaryImages}
                maxFiles={10}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Product Videos</Label>
              <CloudinaryVideoUpload
                onVideosUploaded={handleCloudinaryVideosUploaded}
                onVideosRemoved={handleCloudinaryVideosRemoved}
                existingVideos={memoizedVideos}
                maxFiles={5}
                maxSize={100 * 1024 * 1024} // 100MB
                acceptedTypes={['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv']}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Gallery Images (Additional)</Label>
              <p className="text-sm text-muted-foreground">
                Additional images for product detail page gallery. These will be displayed in the product gallery section.
              </p>
              <CloudinaryImageUpload
                onImagesUploaded={handleGalleryImagesUploaded}
                onImagesRemoved={handleGalleryImagesRemoved}
                existingImages={memoizedGalleryImages}
                maxFiles={20}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
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
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Badge Preview</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                  {formData.stock <= 0 && (
                    <Badge variant="secondary" className="bg-stone-500/90 text-white">
                      {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
                    </Badge>
                  )}
                  {formData.stock > 0 && formData.onSale && formData.originalPrice > formData.price && (
                    <Badge variant="destructive" className="bg-red-500/90 text-white">
                      -{Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
                    </Badge>
                  )}
                  {formData.stock > 0 && !formData.onSale && formData.isFeatured && (
                    <Badge variant="default" className="bg-stone-800/90 dark:bg-stone-200/90 text-white dark:text-stone-800">
                      {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
                    </Badge>
                  )}
                  {formData.stock > 0 && !formData.onSale && formData.isNew && (
                    <Badge className="bg-green-500/90 text-white">
                      {language === 'vi' ? 'MỚI' : language === 'ja' ? '新着' : 'NEW'}
                    </Badge>
                  )}
                  {formData.stock > 0 && formData.isLimitedEdition && (
                    <Badge className="bg-purple-500/90 text-white">
                      {language === 'vi' ? 'Phiên bản giới hạn' : language === 'ja' ? '限定版' : 'Limited Edition'}
                    </Badge>
                  )}
                  {formData.stock > 0 && formData.isBestSeller && (
                    <Badge className="bg-orange-500/90 text-white">
                      {language === 'vi' ? 'Bán chạy' : language === 'ja' ? 'ベストセラー' : 'Best Seller'}
                    </Badge>
                  )}
                  {formData.stock > 0 && !formData.onSale && !formData.isFeatured && !formData.isNew && !formData.isLimitedEdition && !formData.isBestSeller && (
                    <span className="text-sm text-muted-foreground">No badges will be displayed</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.tags}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Suggested tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'limited', 'bestseller', 'new', 'featured', 'sale', 'premium', 'organic', 'eco-friendly',
                        'giới hạn', 'bán chạy', 'mới', 'nổi bật', 'giảm giá', 'cao cấp', 'hữu cơ', 'thân thiện môi trường',
                        '限定', 'ベストセラー', '新着', 'おすすめ', 'セール', 'プレミアム', 'オーガニック', 'エコフレンドリー'
                      ].map(suggestedTag => (
                        <Badge
                          key={suggestedTag}
                          variant="outline"
                          className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            if (!formData.tags.includes(suggestedTag)) {
                              setNewTag(suggestedTag);
                              addTag();
                            }
                          }}
                        >
                          {suggestedTag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.shipping}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">{t.weight}</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, weight: isNaN(value) ? 0 : value }));
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="length">{t.length}</Label>
                <Input
                  id="length"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.dimensions.length}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      dimensions: { ...prev.dimensions, length: isNaN(value) ? 0 : value }
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">{t.width}</Label>
                <Input
                  id="width"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.dimensions.width}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      dimensions: { ...prev.dimensions, width: isNaN(value) ? 0 : value }
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">{t.height}</Label>
                <Input
                  id="height"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.dimensions.height}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      dimensions: { ...prev.dimensions, height: isNaN(value) ? 0 : value }
                    }));
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
} 